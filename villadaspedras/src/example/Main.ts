'use strict';
// You can access any of the global GAS objects in this file. You can also
// import local files or external dependencies:
// export { helloWorld } from './example';
Object.defineProperty(exports, '__esModule', { value: true });
exports.onOpen = onOpen;
exports.onEdit = onEdit;
exports.onInstall = onInstall;
exports.doGet = doGet;
exports.doPost = doPost;
// Simple Triggers: These five export functions are reserved export function names that are
// called by Google Apps when the corresponding event occurs. You can safely
// delete them if you won't be using them, but don't use the same export function names
// for anything else.
// See: https://developers.google.com/apps-script/guides/triggers
// NOTE: only `export {...}` syntax will work. You cannot define and export a trigger in
// the same line.
function onOpen(e: GoogleAppsScript.Events.AppsScriptEvent): void {
  console.log(e);
}
function onEdit(e: GoogleAppsScript.Events.AppsScriptEvent): void {
  console.log(e);
}
function onInstall(e: GoogleAppsScript.Events.AppsScriptEvent): void {
  console.log(e);
}
function doGet(e: GoogleAppsScript.Events.AppsScriptEvent): void {
  console.log(e);
}
function doPost(e: GoogleAppsScript.Events.AppsScriptEvent): void {
  console.log(e);
}
