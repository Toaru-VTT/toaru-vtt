use poem::{
    error::InternalServerError, listener::TcpListener, middleware::Cors, web::Data, EndpointExt,
    Result, Route, Server,
};
use poem_openapi::{
    param::Path,
    payload::{Json, PlainText},
    ApiResponse, Object, OpenApi, OpenApiService,
};
use sqlx::Postgres;
use tokio_stream::StreamExt;

type DbPool = sqlx::Pool<Postgres>;

/// Todo
#[derive(Object)]
struct Todo {
    id: i32,
    description: String,
    done: bool,
}

/// Todo
#[derive(Object)]
struct UpdateTodo {
    description: Option<String>,
    done: Option<bool>,
}

#[derive(ApiResponse)]
enum GetResponse {
    #[oai(status = 200)]
    Todo(Json<Todo>),

    #[oai(status = 404)]
    NotFound(PlainText<String>),
}

struct TodosApi;

#[OpenApi]
impl TodosApi {
    /// Create an item
    #[oai(path = "/todos", method = "post")]
    async fn create(
        &self,
        pool: Data<&DbPool>,
        description: PlainText<String>,
    ) -> Result<Json<i32>> {
        let result: i32 = sqlx::query_scalar("INSERT INTO todos (description, done) VALUES ($1, false) RETURNING id")
            .bind(description.0)
            .fetch_one(pool.0)
            .await
            .map_err(InternalServerError)?;
        Ok(Json(result))
    }

    /// Find item by id
    #[oai(path = "/todos/:id", method = "get")]
    async fn get(&self, pool: Data<&DbPool>, id: Path<i32>) -> Result<GetResponse> {
        let todo: Option<(i32, String, bool)> =
            sqlx::query_as("select id, description, done from todos where id = ?")
                .bind(id.0)
                .fetch_optional(pool.0)
                .await
                .map_err(InternalServerError)?;

        match todo {
            Some(todo) => Ok(GetResponse::Todo(Json(Todo {
                id: todo.0,
                description: todo.1,
                done: todo.2,
            }))),
            None => Ok(GetResponse::NotFound(PlainText(format!(
                "todo `{}` not found",
                id.0
            )))),
        }
    }

    /// Get all items
    #[oai(path = "/todos", method = "get")]
    async fn get_all(&self, pool: Data<&DbPool>) -> Result<Json<Vec<Todo>>> {
        let mut stream =
            sqlx::query_as::<_, (i32, String, bool)>("select id, description, done from todos")
                .fetch(pool.0);

        let mut todos = Vec::new();
        while let Some(res) = stream.next().await {
            let todo = res.map_err(InternalServerError)?;
            todos.push(Todo {
                id: todo.0,
                description: todo.1,
                done: todo.2,
            });
        }

        Ok(Json(todos))
    }

    /// Delete item by id
    #[oai(path = "/todos/:id", method = "delete")]
    async fn delete(&self, pool: Data<&DbPool>, id: Path<i64>) -> Result<()> {
        sqlx::query("delete from todos where id = ?")
            .bind(id.0)
            .execute(pool.0)
            .await
            .map_err(InternalServerError)?;
        Ok(())
    }

    /// Update item by id
    #[oai(path = "/todos/:id", method = "put")]
    async fn update(
        &self,
        pool: Data<&DbPool>,
        id: Path<i64>,
        update: Json<UpdateTodo>,
    ) -> Result<()> {
        let mut sql = "update todos ".to_string();
        if update.description.is_some() {
            sql += "set description = ?";
        }
        if update.done.is_some() {
            sql += "set done = ?";
        }
        sql += "where id = ?";

        let mut query = sqlx::query(&sql);
        if let Some(description) = &update.description {
            query = query.bind(description);
        }
        if let Some(done) = &update.done {
            query = query.bind(done);
        }

        query
            .bind(id.0)
            .execute(pool.0)
            .await
            .map_err(InternalServerError)?;
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let pool = DbPool::connect("postgres://postgres:password@localhost:5432/todos").await?;

    let api_service =
        OpenApiService::new(TodosApi, "Todos", "1.0.0").server("http://localhost:3000");
    let ui = api_service.swagger_ui();
    let spec = api_service.spec();
    let route = Route::new()
        .nest("/", api_service)
        .nest("/ui", ui)
        .at("/spec", poem::endpoint::make_sync(move |_| spec.clone()))
        .with(Cors::new())
        .data(pool);

    Server::new(TcpListener::bind("0.0.0.0:3000"))
        .run(route)
        .await?;
    Ok(())
}
