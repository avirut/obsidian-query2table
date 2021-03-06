import { TFile, Plugin, parseFrontMatterEntry } from 'obsidian';
import * as jsyaml from './js-yaml';
import * as grid from './grid.min.js';

export default class Query2Table extends Plugin {
  // half of this plugin is shamelessly ripped from https://github.com/phibr0/obsidian-charts
  // the other (even harder) half was from https://github.com/mrjackphil/obsidian-text-expand

  search(s: string) {
    // @ts-ignore
    const globalSearchFn = this.app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch.bind(this);
    const searchFor = (query: string) => globalSearchFn(query);
    searchFor(s);
  }

  async getFoundAfterDelay(delay: number) {
    const searchLeaf = this.app.workspace.getLeavesOfType('search')[0];
    const view = await searchLeaf.open(searchLeaf.view);
    return new Promise(resolve => {
      // @ts-ignore
      setTimeout(() => {
        console.log("logging view: ");
        console.log(view);
        console.log("logging keys: ");
        // @ts-ignore
        console.log(Array.from(view.dom.resultDomLookup.keys()));
        // @ts-ignore
        return resolve(Array.from(view.dom.resultDomLookup.keys()));
      }, delay);
    })
  }

  async getFiles(query: string, approxNumberOfResults: number): Promise<TFile[]> {
    this.search(query);
    let searchTime = approxNumberOfResults * 10 + 500;
    let files = await this.getFoundAfterDelay(searchTime) as TFile[];
    console.log("files being returned after query:")
    console.log(files);
    return files;
  }

  onload() {
    console.log('loading plugin: query2table');
    this.registerMarkdownPostProcessor((el: HTMLElement) => {

      // select for codeblocks
      let blockToReplace = el.querySelector('pre');
      if (!blockToReplace) { return; }

      // out of those, select for query2table codeblocks
      let plotBlock = blockToReplace.querySelector('code.language-query2table');
      if (!plotBlock) { return; }

      // parse YAML
      let yaml = jsyaml.load(plotBlock.textContent)
      if (!yaml || !yaml['query']) { return; }

      // getFiles as a promise, and on completion perform the bulk of the plugin's work
      this.getFiles(yaml['query'], parseInt(yaml['approxNumberOfResults']))
        .then((files: TFile[]) => {
          // console.log(files);
          // console.log(yaml);

          // get initial data, flatten field data
          let fmdata: Object[] = [];
          let fieldData = Object.assign.apply(Object, yaml['fields']);
          let fields = Object.keys(fieldData);

          // build the formatter for each specified field to later pass to grid.js as 'columns'
          let columnData = [];
          for (let field of fields) {
            let curr: any = new Object();
            curr['id'] = field;
            curr['name'] = grid.html(`${field}<br>`);

            let formatter;
            switch (fieldData[field]) {

              case 'note': {
                formatter = (cell: any) => {
                  for (let notefile of files) {
                    let fm = this.app.metadataCache.getFileCache(notefile)?.frontmatter;
                    if (fm && fm[field] && fm[field].indexOf(cell) >= 0) {
                      let myLink = 'obsidian://open?vault=' + notefile.vault.getName() + '&file=' + notefile.path;
                      // console.log(myLink);
                      return grid.html(`<a href="${myLink}">${cell}</a>`);
                    }
                  }
                  return grid.html(`${cell}`);
                }
                break;
              }

              case 'text-as-link': {
                formatter = (cell: any) => grid.html(`<a href="${cell}">${cell}</a>`);
                break;
              }

              case 'link': {
                formatter = (cell: any) => grid.html(`<a href="${cell}">Link</a>`);
                break;
              }

              case 'list': {
                formatter = (cell: any) => {
                  let listhtml = `<ul>`;
                  for (let item of cell) {
                    listhtml += `<li>${item}</li>`;
                  }
                  listhtml += `</ul>`;
                  return grid.html(listhtml);
                }
                break;
              }

              default: {
                formatter = undefined;
              }
            }

            if (formatter) {
              curr['formatter'] = formatter;
            }
            columnData.push(curr);
          }

          // build JSON data (or rather javascript objects) from the pulled files
          fileloop:
          for (let file of files) {
            let curr: any = new Object();
            let fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
            for (let field of fields) {
              curr[field] = parseFrontMatterEntry(fm, field);

              // if the main field is null or undefined, just don't add it
              if (!curr[field] && fieldData[field] == 'note') {
                continue fileloop;
              }
            }

            fmdata.push(curr);
          }

          // render the data with column formatting to destination
          const destination = document.createElement('div');
          new grid.Grid({
            sort: true,
            search: true,
            columns: columnData,
            data: fmdata
          }).render(destination);

          // replace the initial codeblock with the destination
          el.replaceChild(destination, blockToReplace);
        })
    })
  }

  onunload() {
    console.log('unloading plugin: query2table');
  }

}
