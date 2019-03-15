import * as React from 'react';
import * as classNames from 'classnames'

import { CollectiveOrder, HouseholdOrder, Household, PastCollectiveOrder } from '../../Types'
import { ServerApi, ApiError } from '../../ServerApi'
import { Util } from '../../common/Util'
import { RouterLink } from '../../common/RouterLink'
import { Icon } from '../../common/Icon'
import { Money } from '../../common/Money'
import { Router } from '../../common/Router'
import { CurrentOrder } from './CurrentOrder'
import { TopNav } from '../TopNav'

export interface OrdersPageProps { currentOrder: CollectiveOrder | null
                                 , currentHouseholdOrders: HouseholdOrder[]
                                 , pastOrders: PastCollectiveOrder[]
                                 , households: Household[]
                                 , request: <T extends {}>(p: Promise<T>) => Promise<T>
                                 , reload: () => Promise<void>
                                 , loading: boolean
                                 , error: ApiError | null
                                 }

export class OrdersPage extends React.Component<OrdersPageProps, {}> {
  newOrder = () => {
    this.props.request(ServerApi.command.createOrder())
      .then(this.props.reload)
  }

  render() {
    const currentOrder = this.props.currentOrder
    const pastOrders = this.props.pastOrders
    const deletableHousehold = !!this.props.currentHouseholdOrders.length && !!this.props.currentHouseholdOrders.find(ho => !ho.items.length)

    return (
      <div>
        {!!this.props.error && (
          <div>{this.props.error.error}: {this.props.error.message}</div>
        )}
        <div className="bg-order-dark p-2">
          <TopNav className="text-grey-darkest hover:text-black" />
          <div className="bg-img-order bg-no-repeat bg-16 pl-20 min-h-16 relative mt-4">
            <h2 className="leading-none mb-2 -mt-1">Current order{!!this.props.loading && <Icon type="loading" className="w-4 h-4 rotating ml-2 fill-current" />}</h2>
            {currentOrder
            ? (
              <div>
                <h3 className="mt-0 flex justify-between"><span>{Util.formatDate(currentOrder.createdDate)}</span><span><Money amount={currentOrder.total} /></span></h3>
                <h3 className="font-normal">{currentOrder.status}</h3>
              </div>
            )
            : (
              <div>
                <div className="my-2"><Icon type="info" className="w-4 h-4 mr-2 fill-current nudge-d-2" />No order currently in progress</div>
                <div className="flex justify-start">
                  <button onClick={this.newOrder}><Icon type="add" className="w-4 h-4 mr-2 fill-current nudge-d-2" />New order</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {!!currentOrder &&
          <CurrentOrder order={currentOrder}
                        householdOrders={this.props.currentHouseholdOrders}
                        households={this.props.households}
                        reload={this.props.reload}
                        request={this.props.request} />
        }
        <div className="bg-grey-lighter p-2">
          <div className="bg-img-order-bw bg-no-repeat bg-16 pl-20 min-h-16 relative mt-2">
            <h2 className="text-grey-darkest leading-none mb-2 -mt-1">Past orders</h2>
          </div>
        </div>
        {!pastOrders.length
        ? <div className="p-2 mb-4 text-grey-darker"><Icon type="info" className="w-4 h-4 mr-2 fill-current nudge-d-2" />No past orders</div> 
        : (
          <table className="border-collapse w-full mb-4">
            <tbody>
              { pastOrders.map(o => (
                <tr key={o.id} className={classNames({'crossed-out': o.isCancelled})}>
                  <td className="pt-2 pl-2 pr-2"><RouterLink path={`/admin/orders/${o.id}`}>{ Util.formatDate(o.createdDate)}</RouterLink></td>
                  <td className="pt-2 pr-2">{o.isCancelled && 'Cancelled'}</td>
                  <td className="pt-2 pr-2 text-right"><Money amount={o.total} /></td>
                </tr>
              )) }
            </tbody>
          </table>
        )}
      </div>
    )
  }
}