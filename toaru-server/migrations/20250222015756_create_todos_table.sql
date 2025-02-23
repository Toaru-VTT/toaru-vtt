-- Add migration script here
CREATE TABLE todos(
    id SERIAL PRIMARY KEY,
    description VARCHAR,
    done BOOLEAN
);
