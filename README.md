# GAS-Utilities
This is TypeScript modules for Google Apps Script with `clasp`.

## AutoFoldering
Making annually or monthly named folder on your Google Drive such as below:
```
RootFolder
 |- 2017
 `- 2018
    |- 01
    |- 02
    |- 03
    `- 04 <= YOUR_APRIL_LOGS
        |- 2018-04-01_foo.logs
        |- 2018-04-02_foo.logs
                :
```
### Example
```TypeScript
import AutoFoldering from 'AutoFoldering';
const rootFolderId = '<YOUR_ROOT_FOLDER_ID>';
const LogFolder = new AutoFoldering(reportRootFolderId,'JST').setYear(2018).setMonth(04).getReportFolder();

console.log(LogFolder.getId());
```
## SubmitEvent
Event class on submit of Google Spreadsheet, Form and etc.

## Process
Some utility service for Google Apps 