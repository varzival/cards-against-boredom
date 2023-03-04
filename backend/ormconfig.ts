import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "postgres",
  database: "cards-against-kern",
  entities: ["**/*.entity{.ts,.js}"],
  migrations: ["./migrations/**/*"],
  synchronize: false
});

export default dataSource;
