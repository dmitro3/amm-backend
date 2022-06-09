# fcxv2-backend

## Description
FCX V2 Backend

## Running the app in the first time
### Remember install docker, docker-compose before run command below:
```bash
$ cp .env.example .env 

$ docker-compose up -d
```
### See log application:

```bash
$ docker logs fcx-backend -f
```

## Migration:
 See in [link](MIGRATION.md)

## Seed:
```bash
$ yarn console:dev seed
```

## Environment

Powered by [Nest](https://github.com/nestjs/nest)

- Node: v14.17.0
- Yarn: v1.22.10

## Coding conventions
- Using space (not tab)
- RESTful API:
  - https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/
  - https://betterprogramming.pub/22-best-practices-to-take-your-api-design-skills-to-the-next-level-65569b200b9
- Naming file and URL path: using `-` as separator
- Avoid using `any` in `typescript` as much as possible
- Avoid `SELECT *` in `sql` query
- Except `entity.ts`, others should be named as plural (E.g: `orders.service.ts`, NOT `order.service.ts`)
- Code comment: prefer self-explanatory code, should comment at class and function level
- Columns in entity follow by snake case.
- Using connection: report for read, master for write.
- Commit Convention: see in [link](CommitConversion.md)
## Some techniques
- Must read documentations: https://docs.nestjs.com/first-steps. Specially https://docs.nestjs.com/modules
- Hidden secret fields: https://docs.nestjs.com/techniques/serialization
- Database transaction: https://docs.nestjs.com/techniques/database#transactions
- Cron: https://docs.nestjs.com/techniques/task-scheduling. For catching error in cron, can try https://stackoverflow.com/questions/60402716/nestjs-handle-service-exceptions
- i18n: using package https://github.com/ToonvanStrijp/nestjs-i18n
