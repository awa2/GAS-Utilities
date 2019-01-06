# GAS-Utilities

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
const rootFolderId = '<YOUR_ROOT_FOLDER_ID>';
const LogFolder = new AutoFolderApp(reportRootFolderId).setYear(2018).setMonth(04).getReportFolder();

console.log(LogFolder.getId());
```
## SubmitEvent
Event class on submit of Google Spreadsheet, Form and etc.

## Process
