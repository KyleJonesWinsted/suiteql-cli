# SuiteQL CLI

A command line tool for fetching data from NetSuite using SuiteQL


## Installation

This tool can be installed globally through NPM

```bash
npm install -g suiteql-cli
```

This will add a new `suiteql` command to your PATH.

```bash
suiteql -help
```

## Usage

Queries can be provided directly in the command using the `-s` flag or `-f` to read from a file. You can also provide a query through `stdin` either by typing in the console or by piping from another file or program.

You can manually choose an account to run queries against, or the tool will automatically remember which account was used most recently. Account names can be anything you would like.

Query results can be output as a table, CSV, or JSON.

Authentication into NetSuite is accomplished in the browser via OAuth 2.0. You must have the OAuth 2.0 feature enabled in your account under Setup -> Company -> Enable Features -> SuiteCloud. Your role must also have the following permissions:

- Setup -> REST Web Services
- Setup -> Log in using OAuth 2.0 Access Tokens
- Reports -> SuiteAnalytics Workbook

Some account adminstrators may limit access to new integrations. If this is the case, speak to your NetSuite account admin about enabling the "SuiteQL CLI" integration record.

### Examples

Basic query:
```bash
suiteql -a production -s "SELECT COUNT(*) FROM employee"
```

Reading query from stdin:
```bash
cat my-query.sql | suiteql
```
or 
```bash
suiteql < my-query.sql
```

Writing to a CSV file
```bash
suiteql -s "SELECT * FROM items" -csv > output.csv
```


### Arguments

| Flag   | Definition                                                                                     |
| ------ | ---------------------------------------------------------------------------------------------- |
| -help  | View a full list of arguments                                                                  |
| -a     | Account nickname to run query against. If none is provided, the last used account will be used |
| -s     | Query string to run. A file can be used instead with "-f"                                      |
| -f     | File path containing a query to run. A string can be used instead with "-s"                    |
| -csv   | Outputs results as CSV. Default output is a table                                              |
| -json  | Outputs results as JSON. Default output is a table                                             |
| -list  | Lists all accounts and their expiration status                                                 |
| -reset | Removes all account authentication data.                                                       |
