import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'
import FormPanel from './FormPanel'
import AlertPanel from './AlertPanel'
import localeUtil from 'keys-translations-manager-core/lib/localeUtil'
import configUtil from '../../configUtil'

const locales = configUtil.getLocales()

export default class EditModal extends React.PureComponent {
	static propTypes = {
		showeditmodal: PropTypes.bool.isRequired,
		closeEditModal: PropTypes.func.isRequired,
		data: PropTypes.object.isRequired,
		errors: PropTypes.array.isRequired,
		updateTranslation: PropTypes.func.isRequired,
		alertErrors: PropTypes.func.isRequired,
		clearErrors: PropTypes.func.isRequired
	};

	constructor() {
		super();
		this.updateTranslation = this.updateTranslation.bind(this);
		this.close = this.close.bind(this);
	}

	/* istanbul ignore next */
	updateTranslation() {
		const el = this.refFormPanel.getFormElements(),
			projects = el["project[]"],
			lenProjects = projects.length,
			lenLocales = locales.length;
		let i, v, locale,
			project = [],
			emptyFields = [],
			data = Object.assign({}, this.props.data, {description: el.description.value.trim()});

		for (i = 0; i < lenLocales; i++) {
			locale = locales[i]
			v = el[locale].value.trim()
			if (v) {
				data[locale] = v
			} else {
				emptyFields.push(localeUtil.getMsg("ui.common.locale") + " / " + locale)
			}
		}

		for (i = 0; i < lenProjects; i++) {
			if (projects[i].checked) {
				project.push(projects[i].value);
			}
		}
		if (project.length > 0) {
			data.project = project
		} else {
			emptyFields.push(localeUtil.getMsg("ui.common.applyto"))
		}

		if (emptyFields.length > 0) {
			this.props.alertErrors([{
				type: 'emptyfield',
				action: "u",
				params: data,
				match: emptyFields
			}]);
		} else {
			this.props.updateTranslation(data);
		}
	}

	close() {
		this.props.closeEditModal()
	}

	render() {
		const { data, errors, clearErrors } = this.props;

		return (
			<Modal show={this.props.showeditmodal} onHide={this.close}>
				<Modal.Header>
					<Modal.Title>
						{localeUtil.getMsg("ui.common.edit")}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<AlertPanel errors={errors} clearErrors={clearErrors} action="u"/>
					<FormPanel
						ref={cmp => { this.refFormPanel = cmp; }}
						action="u" data={data}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button bsSize="small" bsStyle="primary" onClick={this.updateTranslation}>
						{localeUtil.getMsg("ui.common.update")}
					</Button>
					<Button bsSize="small" onClick={this.close}>
						{localeUtil.getMsg("ui.common.cancel")}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}
