import * as React from 'react';

import { CollectiveOrder } from './Types'
import { ServerApi, ApiError } from './ServerApi'
import { Util } from './Util'
import { Link, RouterLink } from './Link'
import { Money } from './Money'

export interface FullOrderPageProps { order: CollectiveOrder
                                    , request: <T extends {}>(p: Promise<T>) => Promise<T>
                                    }

export class FullOrderPage extends React.Component<FullOrderPageProps, {}> {
  constructor(props: FullOrderPageProps) {
    super(props)

    this.state = { summary: null
                 , initialised: false
                 }
  }

  render() {
    return (
      <div>
        <div>
          <RouterLink path="/orders">Orders</RouterLink> &gt;
          <RouterLink path={`/orders/${this.props.order.id}`}>{Util.formatDate(this.props.order.createdDate)}</RouterLink> &gt;
        </div>
        <h1>Full order list</h1>
        <div>
          {this.props.order.items.map(i => (
            <div key={i.productId}>
              <span>{i.productName}</span>
              <span>x {i.itemQuantity}</span>
              <Money amount={i.itemTotal} />
            </div>
          ))}
          <div>
            <span>Total:</span>
            <span></span>
            <Money amount={this.props.order.total} />
          </div>
        </div>
      </div>
    )
  }
}