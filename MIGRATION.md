### Create new custom migrate file
```
yarn run typeorm:create name_migration_file
```
### Create migrate file for present status (after change entiry, create new entity, etc):
```
yarn run typeorm:migrate
```
### Apply migrate file:
```
yarn run typeorm:run
```

### revert migrate file:
#### Notice: This command will execute down in the latest executed migration. If you need to revert multiple migrations you must call this command multiple times. 
```
yarn run typeorm:revert
```

### More info: https://typeorm.io/#/migrations

