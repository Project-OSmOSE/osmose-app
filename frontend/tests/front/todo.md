# TODO

## Missing Front tests

- rename e2e folder to front

### Auth

- show server errors (ex: 500) in toast

### Dataset

- Handle 401
- Handle 403
- show server errors (ex: 500) in toast

### Campaign

#### List

- Handle 401
- show server errors (ex: 500) in toast
- check campaign progress is present in main case
- check my progress is only present if i'm an annotator (cf admin who's not an annotator)

#### Detail

- Handle 401
- Handle 403
- show server errors (ex: 500) in toast
- status sort (by annotator or progress)

#### File list

- Handle 401
- Handle 403
- show server errors (ex: 500) in toast

#### Edit

- Handle 401
- Handle 403
- show server errors (ex: 500) in toast
- Add new annotator
- Cannot remove annotator with finished tasks
- Can remove annotator without finished tasks

### E2E tests

Create 2 2E2 tests :

- create a "create" campaign and assure file list is ok and it can be annotated by the right user with the right labels
  and then exported
- create a "check" campaign and assure file list really shows the imported results and it can be validated by the right
  users and then exported
