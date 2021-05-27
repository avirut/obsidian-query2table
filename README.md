# ARCHIVED
This plugin was a temporary solution to a problem that has now been better solved by [Obsidian Dataview](https://github.com/blacksmithgu/obsidian-dataview). In the future, I may fork Obsidian Dataview to match the rendering featureset that I want while keeping its far superior query handlers. This plugin, however, will receive no further updates.

# obsidian-query2table
Represent files returned by a query as a table of their YAML frontmatter

## Disclaimer
During usage, this plugin *will* overwrite your search pane - this is necessary to run the query. You also will not be able to run two query blocks in the same file.

Also, I haven't really tested this plugin at all on any vaults but my own, and there are likely many places where the appropriate checks for `null` or `undefined` values are missing. Therefore, you may experience significant errors early on. When this happens, please open DevTools (`ctrl/cmd + shift + i`), save the console error output, and report it as an issue through this repository's `Issues` tab. This plugin *shouldn't* delete your files or anything, but it may just occassionally not work as expected.

## Table generation from query
This plugin allows you to output the results of a query as a searchable, sortable table of the frontmatter attributes from relevant notes.
![sample codeblock](https://github.com/avirut/obsidian-query2table/blob/master/imgs/codeblock.png?raw=true)

## Usage
Within your `query2table` codeblock, specify the attributes `query`, `fields`, and `approxNumberOfResults`.

### Query
A string (enclosed in `""` or `''`) which indicates what you're searching for. This is the same format as if you were using the built in file-search (because the plugin actually does use the built in file search).

### Fields
A list of the YAML frontmatter attributes, and their corresponding "type". Available types are:
- `note` - The text will be the same as the frontmatter attribute, but this column will link to the actual note the row refers to. The frontmatter value for whatever attribute this refers to *must* be present (not `null` or `undefined`), or the row for that file will not be shown.
- `link` - Long links are handled poorly by the table (they take up a lot of width), so use this attribute to replace them with the word `Link` that has a hyperlink to whatever link was specified in the frontmatter attribute.
- `text-as-link` - This one uses the original text of the frontmatter attribute, but makes it a link as well. It's similar to `link`, but possibly better if seeing the actual link before you click it is really important to you.
- `list` - Use this for frontmatter attributes that are text arrays - the value in the table will show as a bullet pointed list.

If you have any good ideas for field types, feel free to open up an issue and I'll work on it when I get the chance.

###  Approximate Number of Results
Because of limitations within the Obsidian API, the only way to make the querying part of this plugin work is to run the query through the UI, then pull out the returned files. This means that whenever the `query2table` codeblock is rendered, you'll see the search being run in your UI as well. However, there is some delay between the search being run and the files being output. If this delay is too short, you may not get all your files into the table. Adjust `approxNumberOfResults` as necessary to ensure that you get all your files without waiting too long.

## Sample Output
### Full Results
![full results](https://github.com/avirut/obsidian-query2table/blob/master/imgs/full-results.png?raw=true)
### Search and Sort
![search and sort](https://github.com/avirut/obsidian-query2table/blob/master/imgs/search-sort-results.png?raw=true)

## Credits
Much of the code/structure in this plugin came from [obsidian-charts](https://github.com/phibr0/obsidian-charts) and [obsidian-text-expand](https://github.com/mrjackphil/obsidian-text-expand). Also, thanks to Liam and Licat in the Discord #plugins channel for their frequent help!
