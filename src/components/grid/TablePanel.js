import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/lib/Button'
import InputGroup from 'react-bootstrap/lib/InputGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ReactTable from "react-table"
import localeUtil from 'keys-translations-manager-core/lib/localeUtil'
import ActionCellRenderer from './ActionCellRenderer'
import Mask from '../layout/Mask'
import { getLocales, getProjectName } from '../../configUtil'

const locales = getLocales()

export default class TablePanel extends React.PureComponent {
	static propTypes = {
		reloaddata: PropTypes.bool,
		messages: PropTypes.object,
		CountActions: PropTypes.object.isRequired,
		TranslationActions: PropTypes.object.isRequired,
		ComponentActions: PropTypes.object.isRequired,
		translations: PropTypes.array
	};

	constructor(props) {
		super(props);

		this.state = {
			quickFilterText: null,
			windowHeight: 0
		};

		//https://gist.github.com/Restuta/e400a555ba24daa396cc
		this.handleResize = this.handleResize.bind(this);
		this.onQuickFilterText = this.onQuickFilterText.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this.handleResize);
		this.loadData();
	}

	componentDidUpdate(prevProps) {
		const { reloaddata, translations, CountActions } = this.props;

		if (reloaddata) {
			this.loadData();
		}

		if (translations && translations !== prevProps.translations) {
			CountActions.loadCounts();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	loadData() {
		this.props.TranslationActions.loadTranslations();
	}

	/* istanbul ignore next */
	handleResize() {
		this.setState({
			windowHeight: window.innerHeight
		});
	}

	onQuickFilterText(event) {
		this.setState({
			quickFilterText: event.target.value
		});
	}

	downloadCsv() {
		let url = '/api/download/csv'

		/* istanbul ignore next */
		location.href = url;
	}

	getColumnDefs() {
		return [
			{
				Header: localeUtil.getMsg("ui.common.action"),
				accessor: '_id',
				headerClassName: 'app-grid-header',
				width: 85,
				Cell: c => <ActionCellRenderer data={c.original} ComponentActions={this.props.ComponentActions} />
			}, {
				Header: localeUtil.getMsg("ui.common.applyto"),
				accessor: 'project',
				headerClassName: 'app-grid-header',
				Cell: c => c.value.map(e => getProjectName(e)).join(', '),
			}, {
				Header: 'Key',
				accessor: 'key',
				headerClassName: 'app-grid-header',
			}, ...locales.map(locale => ({
				Header: `${localeUtil.getMsg("ui.common.locale")} / ${locale}`,
				accessor: locale,
				headerClassName: 'app-grid-header',
			})), {
				Header: localeUtil.getMsg("ui.common.desc"),
				accessor: 'description',
				headerClassName: 'app-grid-header',
			}
		];
	}

	render() {
		const minHeight = 200,
			top = 370,
			windowHeight = this.state.windowHeight ||
						(typeof window === "undefined" ? minHeight + top : window.innerHeight);

		return (
			<Fragment>
				<InputGroup>
					<InputGroup.Addon className="app-search-icon">
						<i className="fa fa-search"/>
					</InputGroup.Addon>
					<FormControl type="text" className="app-search-bar"
						placeholder={localeUtil.getMsg("ui.grid.search")}
						onChange={this.onQuickFilterText}/>
					<InputGroup.Button style={{"paddingLeft": "5px"}}>
						<Button onClick={this.downloadCsv}>
							<i className="fa fa-file-text-o"/> CSV
						</Button>
					</InputGroup.Button>
				</InputGroup>
				<ReactTable
					data={this.props.translations || []}
					columns={this.getColumnDefs()}
					defaultPageSize={100}
					previousText={localeUtil.getMsg("ui.pagination.previous")}
					nextText={localeUtil.getMsg("ui.pagination.next")}
					// loadingText: 'Loading...',
					noDataText={localeUtil.getMsg("ui.grid.empty")}
					pageText={localeUtil.getMsg("ui.pagination.page")}
					ofText={localeUtil.getMsg("ui.pagination.of")}
					rowsText={localeUtil.getMsg("ui.pagination.rows")}
					style={{
						height: `${(windowHeight < (minHeight + top) ? minHeight : windowHeight - top)}px`
					}}
					className='-striped -highlight'
				/>
				<Mask show={!this.props.translations}/>
			</Fragment>
		);
	}
}
