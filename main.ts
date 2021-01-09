import { App, MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer, MarkdownRenderer, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as jsyaml from './js-yaml';

export default class Query2Table extends Plugin {

	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		// the base of this plugin is built off of https://github.com/phibr0/obsidian-charts

		//Which Block should be replaced? -> Codeblocks
		let blockToReplace = el.querySelector('pre')
		if (!blockToReplace) { return; }

		//Only Codeblocks with the Language "chart" should be replaced
		let plotBlock = blockToReplace.querySelector('code.language-query2table')
		if (!plotBlock) { return; }

		// Parse the Yaml content of the codeblock, if the labels or series is missing return too
		let yaml = jsyaml.load(plotBlock.textContent)
		if (!yaml || !yaml['query']) { return; }
		console.log(yaml);

		//create the new element
		const destination = document.createElement('div')

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

		el.replaceChild(destination, blockToReplace)
	}

	onload() {
		console.log('loading plugin: chartist');
		MarkdownPreviewRenderer.registerPostProcessor(Query2Table.postprocessor)
	}

	onunload() {
		console.log('unloading plugin: chartist');
		MarkdownPreviewRenderer.unregisterPostProcessor(Query2Table.postprocessor)
	}

}
