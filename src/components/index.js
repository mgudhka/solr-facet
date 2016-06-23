import React from "react";
import cx from "classnames";

import TextSearch from "./text-search";
import ListFacet from "./list-facet";

import Result from "./results/result";
import ResultHeader from "./results/header";
import ResultList from "./results/list";
import ResultPending from "./results/pending";
import ResultContainer from "./results/container";
import ResultPagination from "./results/pagination";

import SearchFieldContainer from "./search-field-container";

import RangeFacet from "./range-facet";
import CountLabel from "./results/count-label";
import SortMenu from "./sort-menu";


import store from "../reducers/store";

import {
	onInit,
	onSearchFieldChange,
	onSortFieldChange,
	onPageChange
} from "../actions";



class SolrFacetedSearch extends React.Component {

	constructor(props) {
		super(props);

		this.state = store.getState();
	}

	componentDidMount() {
		this.unsubscribe = store.subscribe(this.updateState.bind(this));
		onInit(this.props.solrUrl, this.props.searchFields, this.props.sortFields, this.props.rows, this.props.pageStrategy);
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	updateState() {
		this.setState(store.getState());
	}



	render() {
		const { query, results } = this.state;

		const { searchFields, sortFields } = query;

		const { customComponents, bootstrapCss } = this.props;

		const SearchFieldContainerComponent = customComponents.searchFields.container;
		const ResultContainerComponent = customComponents.results.container;

		const ResultCount = customComponents.results.resultCount;
		const ResultHeaderComponent = customComponents.results.header;
		const ResultListComponent = customComponents.results.list;
		const ResultPendingComponent = customComponents.results.pending;
		const PaginateComponent = customComponents.results.paginate;

		const SortComponent = customComponents.sortFields.menu;
		const resultPending = results.pending ? (<ResultPendingComponent bootstrapCss={bootstrapCss} />) : null;

		const pagination = query.pageStrategy === "paginate" ?
			<PaginateComponent {...this.state} bootstrapCss={bootstrapCss} onChange={onPageChange} /> :
			null;

		return (
			<div className={cx("solr-faceted-search", {"container": bootstrapCss, "col-md-12": bootstrapCss})}>
				<SearchFieldContainerComponent bootstrapCss={bootstrapCss}>
					{searchFields.map((searchField, i) => {
						const { type, field } = searchField;
						const SearchComponent = customComponents.searchFields[type];
						const facets = type === "list-facet" || type === "range-facet" ? results.facets[field] || [] : null;
						return (<SearchComponent
							key={i} {...this.state} {...searchField}
							bootstrapCss={bootstrapCss}
							facets={facets}
							onChange={onSearchFieldChange} />
						);
					})}
				</SearchFieldContainerComponent>

				<ResultContainerComponent bootstrapCss={bootstrapCss}>
					<ResultHeaderComponent bootstrapCss={bootstrapCss}>
						<ResultCount bootstrapCss={bootstrapCss} numFound={results.numFound} />
						{resultPending}
						<SortComponent bootstrapCss={bootstrapCss} onChange={onSortFieldChange} sortFields={sortFields} />
					</ResultHeaderComponent>
					{pagination}
					<ResultListComponent bootstrapCss={bootstrapCss}>
						{results.docs.map((doc, i) => (
							<Result bootstrapCss={bootstrapCss}
								doc={doc}
								fields={this.props.searchFields}
								key={i}
								onSelect={this.props.onSelectDoc} />
						))}
					</ResultListComponent>
					{pagination}
				</ResultContainerComponent>
			</div>
		);
	}
}

SolrFacetedSearch.defaultProps = {
	bootstrapCss: true,
	customComponents: {
		searchFields: {
			text: TextSearch,
			"list-facet": ListFacet,
			"range-facet": RangeFacet,
			container: SearchFieldContainer
		},
		results: {
			result: Result,
			resultCount: CountLabel,
			header: ResultHeader,
			list: ResultList,
			container: ResultContainer,
			pending: ResultPending,
			paginate: ResultPagination
		},
		sortFields: {
			menu: SortMenu
		}
	},
	pageStrategy: "paginate",
	rows: 20,
	searchFields: [
		{type: "text", field: "*"}
	],
	sortFields: []
};

SolrFacetedSearch.propTypes = {
	bootstrapCss: React.PropTypes.bool,
	customComponents: React.PropTypes.object,
	onSelectDoc: React.PropTypes.func.isRequired,
	pageStrategy: React.PropTypes.string,
	resultCountLabels: React.PropTypes.object,
	rows: React.PropTypes.number,
	searchFields: React.PropTypes.array,
	solrUrl: React.PropTypes.string.isRequired,
	sortFields: React.PropTypes.array
};

export default SolrFacetedSearch;