import * as React from 'react';
import * as classNames from 'classnames'

import { Household } from '../Types'
import { ServerApi, ApiError } from '../ServerApi'
import { Util } from '../Util'
import { RouterLink } from '../RouterLink'
import { Icon } from '../Icon'
import { Form, Field, Validate } from '../Validation'
import { TopNav } from '../TopNav'
import { TextField } from '../Field'

export interface HouseholdsPageProps { households: Household[]
                                     , request: <T extends {}>(p: Promise<T>) => Promise<T>
                                     , reload: () => Promise<void>
                                     , loading: boolean
                                     , error: ApiError | null
                                     }

export interface HouseholdsPageState { editing: 'new' | number | null
                                     , form: Form
                                     }

export class HouseholdsPage extends React.Component<HouseholdsPageProps, HouseholdsPageState> {
  constructor(props: HouseholdsPageProps) {
    super(props)

    this.state = { editing: null
                 , form: Form.create({ name: Field.create((v: string) => v, (v: string) => v, [Validate.required('Name is required')]) })
                 }
  }

  startCreate = () => this.setState({ editing: 'new'
                                    , form: this.state.form.reset({name: ''})
                                    })

  cancelCreate = () => this.setState({ editing: null
                                     , form: this.state.form.reset({name: ''})
                                     })

  confirmCreate = () => {
    const validated = this.state.form.validate()
    console.log(validated)
    this.setState({ form: validated })
    if(validated.valid()) {
      this.props.request(ServerApi.command.createHousehold(validated.fields.name.value))
        .then(this.props.reload)
        .then(_ => this.setState({ editing: null
                                 , form: this.state.form.reset({name: ''})
                                 })
        )
    }
  }

  startEdit = (household: Household) => this.setState({ editing: household.id
                                                      , form: this.state.form.reset({name: household.name})
                                                      })

  cancelEdit = () => this.setState({ editing: null
                                   , form: this.state.form.reset({name: ''})
                                   })

  confirmEdit = () => {
    if(typeof this.state.editing !== 'number') return

    const validated = this.state.form.validate()
    console.log(validated)
    this.setState({ form: validated })
    if(validated.valid()) {
      this.props.request(ServerApi.command.updateHousehold(this.state.editing, validated.fields.name.value))
        .then(this.props.reload)
        .then(_ => this.setState({ editing: null
                                 , form: this.state.form.reset({name: ''})
                                 })
        )
    }
  }

  fieldChanged = (fieldName: string) => (value: string) =>
    this.setState({ form: this.state.form.update(fieldName, value) })

  delete = (h: Household) => 
    this.props.request(ServerApi.command.archiveHousehold(h.id))
      .then(this.props.reload)

  render() {
    return (
      <div>
        {!!this.props.error && (
          <div>{this.props.error.error}: {this.props.error.message}</div>
        )}
        <div className="bg-household-light p-2">
          <TopNav className="text-household-dark hover:text-household-darker" />
          <div className="bg-img-household bg-no-repeat bg-16 pl-20 min-h-16 relative mt-4">
            <h2 className="leading-none mb-2 -mt-1 text-household-darker">Households{!!this.props.loading && <Icon type="loading" className="w-4 h-4 rotating ml-2 fill-current" />}</h2>
            <div className="flex justify-start">
              <button onClick={this.startCreate} disabled={!!this.state.editing}><Icon type="add" className="w-4 h-4 mr-2 fill-current nudge-d-2" />New household</button>
            </div>
          </div>
        </div>
        <div>
          {this.state.editing == 'new' &&
            <div className="bg-household-lightest p-2">
              <h3 className="mb-4">Create new household</h3>
              <TextField id="create-name"
                         label="Name"
                         field={this.state.form.fields.name}
                         valueOnChange={this.fieldChanged('name')} />
              <div className="flex justify-end">
                <button className="ml-2" onClick={this.confirmCreate} disabled={!this.state.form.valid()}><Icon type="ok" className="w-4 h-4 mr-2 fill-current nudge-d-1" />Save</button>
                <button className="ml-2" onClick={this.cancelCreate}><Icon type="cancel" className="w-4 h-4 mr-2 fill-current nudge-d-1" />Cancel</button>
              </div>
            </div>
          }
          {!this.props.households.length && !this.state.editing
          ? <div className="p-2 mb-4 text-grey-darker"><Icon type="info" className="w-4 h-4 mr-2 fill-current nudge-d-2" />No households created yet</div>
          : (
            <div>
              { this.props.households.map((h, i) => 
              this.state.editing == h.id
              ? (
                <div key={h.id} className={classNames('bg-household-lightest p-2', {'mt-2': i > 0})}>
                  <h3 className="mb-4">Edit household</h3>
                  <TextField id="edit-name"
                             label="Name"
                             field={this.state.form.fields.name}
                             valueOnChange={this.fieldChanged('name')} />
                  <div className="flex justify-end">
                    <button className="ml-2" onClick={this.confirmEdit} disabled={!this.state.form.valid()}><Icon type="ok" className="w-4 h-4 mr-2 fill-current nudge-d-1" />Save</button>
                    <button className="ml-2" onClick={this.cancelEdit}><Icon type="cancel" className="w-4 h-4 mr-2 fill-current nudge-d-1" />Cancel</button>
                  </div>
                </div>
              )
              : (
                <div key={h.id} className="flex justify-between items-baseline px-2 mt-2">
                  <RouterLink className="flex-grow" path={`/households/${h.id}`}>{h.name}</RouterLink>
                  <span className="flex-no-shrink flex-no-grow">
                    <button className="ml-2" onClick={_ => this.startEdit(h)} disabled={!!this.state.editing}><Icon type="edit" className="w-4 h-4 fill-current nudge-d-1" /></button>
                    <button className="ml-2" onClick={_ => this.delete(h)} disabled={!!this.state.editing}><Icon type="delete" className="w-4 h-4 fill-current nudge-d-1" /></button>
                  </span>
                </div>
              )) }
            </div>
          )}
        </div>
      </div>
    )
  }
}