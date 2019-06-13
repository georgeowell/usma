import * as React from 'react';
import * as classNames from 'classnames'

import { CollectiveOrder, Household, HouseholdOrder } from '../Types'
import { ServerApi } from '../ServerApi'
import { Icon } from '../common/Icon'
import { Money } from '../common/Money'
import { Collapsible } from '../common/Collapsible'
import { CurrentHouseholdOrder } from './CurrentHouseholdOrder'

export interface HouseholdOrdersProps { order: CollectiveOrder
                                      , householdOrders: HouseholdOrder[]
                                      , households: Household[]
                                      , request: <T extends {}>(p: Promise<T>) => Promise<T>
                                      , reload: () => Promise<void>
                                      }

export interface HouseholdOrdersState { expanded: number | null }

export class HouseholdOrders extends React.Component<HouseholdOrdersProps, HouseholdOrdersState> {
  constructor(props: HouseholdOrdersProps) {
    super(props)

    this.state = { 
      expanded: null, 
    }
  }

  toggle = (toExpand: HouseholdOrder) => () => { 
    this.setState(({expanded}) => ({expanded: toExpand.householdId == expanded? null : toExpand.householdId}));
  }

  render() {
    const order = this.props.order

    return (
      !this.props.householdOrders.length?
        <div className="px-2 py-4 text-grey-darker">
          <Icon type="info" className="w-4 h-4 mr-2 fill-current nudge-d-2" />No households added to this order yet
        </div>
      : <div> 
          <div className="flex justify-end mb-2 mr-2">
            <button className="flex-no-grow flex-no-shrink" onClick={e => document.location.href = ServerApi.url("query/household-orders-download/")}><Icon type="download" className="w-4 h-4 fill-current mr-2 nudge-d-2" />Download CSV file</button>
          </div>
          <table className="border-collapse w-full">
            <tbody>
              {this.props.householdOrders.map((ho, i) => {
                let status = 
                  <span>
                    { ho.isComplete?
                      <span><Icon type="ok" className="w-4 h-4 fill-current nudge-d-2 mr-2" />Complete</span>
                    : ho.isAbandoned?
                      <span><Icon type="cancel" className="w-4 h-4 fill-current nudge-d-2 mr-2" />Abandoned</span>
                    : <span><Icon type="play" className="w-4 h-4 fill-current nudge-d-2 mr-2" />Open</span>
                    }
                  </span>

                return (
                  <tr key={ho.householdId}>
                    <td colSpan={3}>
                      <Collapsible className="min-h-20"
                                   expanded={this.state.expanded == ho.householdId}
                                   otherExpanding={!!this.state.expanded && this.state.expanded != ho.householdId}
                                   toggle={this.toggle(ho)}
                                   header={() =>
                                     <div className={classNames('p-2 bg-household-lighter min-h-20')}>
                                       <div className="bg-no-repeat w-16 h-16 absolute bg-img-household"></div>
                                       <h3 className="leading-none ml-20 relative flex">
                                         {ho.householdName}
                                       </h3>
                                       <h4 className="flex justify-between ml-20 mt-4 mb-4">
                                         {status}
                                         <span className="flex justify-end">
                                           <span>Total:</span>
                                           <span className={classNames("w-24 font-bold text-right", {'line-through text-grey-darker': ho.isAbandoned})}><Money amount={ho.totalIncVat} /></span>
                                         </span>
                                       </h4>
                                     </div>
                                   }>
                        <div className="shadow-inner-top bg-white">
                          {!ho.items.length?
                            <div className="px-2 py-4 text-grey-darker">
                              <Icon type="info" className="w-4 h-4 mr-2 fill-current nudge-d-2" />No order items yet
                            </div>
                          : <CurrentHouseholdOrder currentHouseholdOrder={ho}
                                                   reload={this.props.reload}
                                                   request={this.props.request}
                                                   readOnly={true} />
                          }
                        </div>
                      </Collapsible>
                    </td>
                  </tr>
                )}
              )}
              <tr>
                <td className="pt-4 pb-4 pl-2 pr-2 font-bold" colSpan={3}>
                  <div className="flex justify-end">
                    <span>Total:</span>
                    <span className="w-24 font-bold text-right"><Money amount={order.totalIncVat} /></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
    )
  }
}