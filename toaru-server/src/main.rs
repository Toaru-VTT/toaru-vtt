#[tokio::main]
async fn main() {
    tokio::spawn(async {
        println!("Hello, World!");
    }).await.unwrap();
}
