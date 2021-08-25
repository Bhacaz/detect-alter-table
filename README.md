# Detect Alter Table

GitHub Action to analyze Rails migrations files content to detect presence method that results to an `ALTER TABLE`.

## Parameters

| Name | Description | Required | Default |
| ---- | --- | --- | --- |
| `gh-token` | A Github Personal Acsess Token | true | N/A |
| `error-message` | A custom error message when the action detect an `ALTER TABLE` method | false | `ALTER TABLE method found.`

## Example of workflow

```yml
name: Check migrations
on:
  pull_request:
    types: [synchronize]
    branches:
        - master
jobs:
  detect_alter_table:
    runs-on: ubuntu-latest
    name: Detect presence of alter table
    steps:
      - name: Detect presence of alter table
        uses: Bhacaz/detect-alter-table@main
        with:
          gh-token: ${{ secrets.GH_TOKEN }}
          error-message: Migration should target the migration branch.
```
