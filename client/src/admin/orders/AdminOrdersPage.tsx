import * as React from 'react';

import { CollectiveOrder, Household, PastCollectiveOrder } from '../../util/Types'
import { Collapsible, CollapsibleState } from '../../util/Collapsible'
import { ServerApi } from '../../util/ServerApi'
import { Router } from '../../util/Router'
import { Icon } from '../../util/Icon'

import { AdminTopNav } from '../AdminTopNav'

import { PastCollectiveOrders } from './PastCollectiveOrders'
import { OrderTabs } from '../../order/OrderTabs'
import { HouseholdOrders } from './HouseholdOrders'
import { OrderItems } from '../../order/OrderItems'
import { ProductCodes } from './ProductCodes'
import { CollectiveOrderButtons } from './CollectiveOrderButtons'
import { CollectiveOrderMessages } from './CollectiveOrderMessages'
import { OrderTotal } from '../../order/OrderTotal'
import { OrderStatus } from '../../order/OrderStatus'

export interface AdminOrdersPageProps { collectiveOrder: CollectiveOrder | null
                                      , pastOrders: PastCollectiveOrder[]
                                      , households: Household[]
                                      , request: <T extends {}>(p: Promise<T>) => Promise<T>
                                      , reload: () => Promise<void>
                                      }

export interface AdminOrdersPageState { collapsibleState: CollapsibleState 
                                        addingHousehold: Household | null
                                        tab: 'households' | 'product-list' | 'product-codes'
                                      }

export class AdminOrdersPage extends React.Component<AdminOrdersPageProps, AdminOrdersPageState> {  
  constructor(props: AdminOrdersPageProps) {
    super(props)

    this.state = { 
      collapsibleState: new CollapsibleState('order', collapsibleState => this.setState({collapsibleState})),
      addingHousehold: null,
      tab: 'households'
    }
  }

  newOrder = () => {
    // TODO: Have some way of choosing the household to create order
    this.props.request(ServerApi.command.createOrder(this.props.households[0].id))
      .then(this.props.reload)
  }

  deleteOrder = () => {
    if(!this.props.collectiveOrder) return

    this.props.request(ServerApi.command.deleteOrder(this.props.collectiveOrder.id))
      .then(this.props.reload)
      .then(_ => Router.navigate(`/admin/orders`))
  }

  abandonOrder = () => {
    if(!this.props.collectiveOrder) return

    this.props.request(ServerApi.command.abandonOrder(this.props.collectiveOrder.id))
      .then(this.props.reload)
  }

  placeOrder = () => {
    if(!this.props.collectiveOrder) return

    this.props.request(ServerApi.command.placeOrder(this.props.collectiveOrder.id))
      .then(this.props.reload)
  }

  render() {
    const order = this.props.collectiveOrder

    return (
      <div className="bg-order-dark min-h-screen">
        <AdminTopNav />
        <Collapsible className="min-h-20"
                     collapsibleKey="order"
                     collapsibleState={this.state.collapsibleState}
                     {...this.props}
                     header={
                       <div className="p-2 bg-order-dark min-h-20">
                         <div className="bg-no-repeat w-16 h-16 absolute bg-img-order"></div>
                         <h2 className="leading-none ml-20 relative flex">
                           Current order
                         </h2>
                         <h3 className="flex justify-between ml-20 mt-4">
                           <OrderStatus order={order} />
                           <OrderTotal order={order} />
                         </h3>
                         <CollectiveOrderButtons order={order}
                            newOrder={this.newOrder} deleteOrder={this.deleteOrder} abandonOrder={this.abandonOrder} placeOrder={this.placeOrder} />
                         {!!order
                         ? <div className="mt-4">
                             <OrderTabs tab={this.state.tab} setTab={tab => this.setState({tab})} />
                           </div>
                         : <span></span>
                         }
                       </div>
                     }>
          { order && (
            this.state.tab == 'households'?
              <div className="shadow-inner-top border-t bg-household-lightest">
                <CollectiveOrderMessages order={order} />
                <div className="flex justify-end mt-4 mr-2">
                  <button className="flex-no-grow flex-no-shrink" onClick={e => document.location.href = ServerApi.url("query/household-orders-download/")}><Icon type="download" className="w-4 h-4 fill-current mr-2 nudge-d-2" />Download CSV file</button>
                </div>
                <HouseholdOrders order={order}
                                 {...this.props} />
              </div>
            : this.state.tab == 'product-list'?
              <div className="shadow-inner-top border-t bg-white">
                <CollectiveOrderMessages order={order} />
                <div className="flex justify-end mr-2 mt-4 mb-2">
                  <button className="flex-no-grow flex-no-shrink" onClick={e => document.location.href = ServerApi.url("query/collective-order-download/")}><Icon type="download" className="w-4 h-4 fill-current mr-2 nudge-d-2" />Download CSV file</button>
                </div>
                <OrderItems order={order} />
              </div>
            : <div className="shadow-inner-top border-t bg-white">
                <CollectiveOrderMessages order={order} />
                <ProductCodes order={order} />
              </div>
            )
          }
        </Collapsible>
        <PastCollectiveOrders collapsibleKey="past-orders"
                              collapsibleState={this.state.collapsibleState}
                              {...this.props} />
      </div>
    )
  }
}