import { App, TFile, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as jsyaml from './js-yaml';

export default class Query2Table extends Plugin {
  // half of this plugin is shamelessly ripped from https://github.com/phibr0/obsidian-charts
  // the other (even harder) half was from https://github.com/mrjackphil/obsidian-text-expand

  search(s: string) {
    const globalSearchFn = this.app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch.bind(this);
    const searchFor = (query: string) => globalSearchFn(query);
    searchFor(s);
  }

  async getFoundAfterDelay(delay: number) {
     const searchLeaf = this.app.workspace.getLeavesOfType('search')[0]
     const view = await searchLeaf.open(searchLeaf.view)
     return new Promise(resolve => {
         // @ts-ignore
         setTimeout(() => resolve(Array.from(view.dom.resultDomLookup.keys())), delay)
     })
 }

  async getFiles(query: string, approxNumberOfResults: number): Promise<TFile[]> {
    this.search(query);
    let searchTime = approxNumberOfResults*10 + 500;
    let files = await this.getFoundAfterDelay(searchTime) as TFile[];
    return files;
  }

	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const _this = ctx.el.ownerDocument.defaultView;

    // select for codeblocks
		let blockToReplace = el.querySelector('pre');
		if (!blockToReplace) { return; }

		// out of those, select for query2table codeblocks
		let plotBlock = blockToReplace.querySelector('code.language-query2table');
		if (!plotBlock) { return; }

		// parse YAML
		let yaml = jsyaml.load(plotBlock.textContent)
		if (!yaml || !yaml['query']) { return; }

    console.log("running the query...");
    _this.app.plugins.plugins['obsidian-query2table']
      .getFiles(yaml['query'], parseInt(yaml['approxNumberOfResults']))
      .then((files: TFile[]) => {
        console.log(files);
        console.log(yaml);

        let html = '';

        for (let file of files) {
          html += file.basename + '<br><br>';
        }

        const destination = document.createElement('div');
        destination.innerHTML = html.trim();

        el.replaceChild(destination, blockToReplace);
      })

		//create the new element

		// if (yaml['type'] === 'line') new Chartist.Line(destination, {
		// 	labels: yaml.labels,
		// 	series: yaml.series
		// }, {
		// 	lineSmooth: Chartist.Interpolation.cardinal({
		// 		fillHoles: yaml.fillGaps ?? false,
		// 	  }),
		// 	  low: yaml.low ?? null,
		// 	  showArea: yaml.showArea ?? false
		// });
		// else if (yaml.type === 'bar') new Chartist.Bar(destination, {
		// 	labels: yaml.labels,
		// 	series: yaml.series
		// }, {
		// 	  low: yaml.low ?? null,
		// });
		// else return
	}

	onload() {
		console.log('loading plugin: query2table');
		MarkdownPreviewRenderer.registerPostProcessor(Query2Table.postprocessor);
	}

	onunload() {
		console.log('unloading plugin: query2table');
		MarkdownPreviewRenderer.unregisterPostProcessor(Query2Table.postprocessor);
	}

}
