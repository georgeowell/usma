import * as React from 'react';

import { ServerApi, ApiError } from './ServerApi'
import { Util } from './Util'
import { RouterLink } from './RouterLink'
import { Button } from './Button'
import { Icon } from './Icon'
import { Router } from './Router'

import { OrdersPage } from './pages/OrdersPage'
import { PastOrderPage } from './pages/PastOrderPage'
import { HouseholdPage } from './pages/HouseholdPage'
import { PastHouseholdOrderPage } from './pages/PastHouseholdOrderPage'
import { FullOrderPage } from './pages/FullOrderPage'
import { ProductsPage } from './pages/ProductsPage'
import { HouseholdsPage } from './pages/HouseholdsPage'
import { HomePage } from './pages/HomePage'
import { CollectiveOrder, HouseholdOrder, Product, Household, HouseholdPayment } from './Types'

export interface MainProps {}
export interface MainState { loading: boolean
                           , error: ApiError | null
                           , initialUrl: string
                           , url: string
                           , collectiveOrders: CollectiveOrder[]
                           , householdOrders: HouseholdOrder[]
                           , products: Product[]
                           , households: Household[]
                           , householdPayments: HouseholdPayment[]
                           , initialised: boolean
                           }

export class Main extends React.Component<MainProps, MainState> {
  router = new Router()

  constructor(props: MainProps) {
    super(props)

    const url = '/' + window.location.href.split('/').filter(l => l.length).slice(2).join('/')

    this.state = { loading: false
                 , error: null
                 , initialUrl: url
                 , url
                 , collectiveOrders: []
                 , householdOrders: []
                 , products: []
                 , households: []
                 , householdPayments: []
                 , initialised: false
                 }
    
    this.router.route('/orders/{orderId}/households/{householdId}', c => {
      const householdOrder = this.state.householdOrders.find(o => o.orderId == c.orderId && o.householdId == c.householdId)
      
      return householdOrder && 
        <PastHouseholdOrderPage referrer="order"
                                householdOrder={householdOrder}
                                loading={this.state.loading}
                                error={this.state.error} />
    })

    this.router.route('/orders/{orderId}/full', c => {
      const order = this.state.collectiveOrders.find(o => o.id == c.orderId)
      
      return order &&
        <FullOrderPage order={order}
                       request={this.request}
                       loading={this.state.loading}
                       error={this.state.error} />
    })

    this.router.route('/orders/{orderId}', c => {
      const order = this.state.collectiveOrders.find(o => o.id == c.orderId)
      const householdOrders = this.state.householdOrders.filter(o => o.orderId == c.orderId)

      return order &&
        <PastOrderPage order={order}
                       householdOrders={householdOrders}
                       loading={this.state.loading}
                       error={this.state.error} />
    })

    this.router.route('/orders', c => {
      const currentOrder = this.state.collectiveOrders.filter(o => !o.isPast)[0]
      const currentHouseholdOrders = this.state.householdOrders.filter(o => currentOrder && o.orderId == currentOrder.id)
      const pastOrders = this.state.collectiveOrders.filter(o => o.isPast)

      return <OrdersPage currentOrder={currentOrder}
                         currentHouseholdOrders={currentHouseholdOrders}
                         households={this.state.households}
                         pastOrders={pastOrders}
                         reload={this.reload}
                         request={this.request}
                         loading={this.state.loading}
                         error={this.state.error} />
    })
    
    this.router.route('/products', _ => <ProductsPage products={this.state.products}
                                                      reload={this.reload}
                                                      request={this.request}
                                                      loading={this.state.loading}
                                                      error={this.state.error} />)
    
    this.router.route('/households/{householdId}/orders/{orderId}', c => {
      const householdOrder = this.state.householdOrders.find(o => o.orderId == c.orderId && o.householdId == c.householdId)
      
      return householdOrder && 
        <PastHouseholdOrderPage referrer="household"
                                householdOrder={householdOrder}
                                loading={this.state.loading}
                                error={this.state.error} />
    })

    this.router.route('/households/{householdId}', c => {
      const household = this.state.households.find(h => h.id == c.householdId)
      const householdOrders = this.state.householdOrders.filter(o => o.householdId == c.householdId)
      const currentCollectiveOrder = this.state.collectiveOrders.find(o => !o.isPast)
      const householdPayments = this.state.householdPayments.filter(o => o.householdId == c.householdId)
      
      return household && 
        <HouseholdPage household={household}
                       currentCollectiveOrder={currentCollectiveOrder}
                       householdOrders={householdOrders}
                       payments={householdPayments}
                       products={this.state.products}
                       reload={this.reload}
                       request={this.request}
                       loading={this.state.loading}
                       error={this.state.error} />
    })
    
    this.router.route('/households', _ => <HouseholdsPage households={this.state.households}
                                                          reload={this.reload}
                                                          request={this.request}
                                                          loading={this.state.loading}
                                                          error={this.state.error} />)
    
    this.router.route('/', _ => <HomePage />)
  }

  componentDidMount() {
    window.onpopstate = e => this.setState({url: e.state || this.state.initialUrl});
    (window as any).history.onpushstate = (state: any, title: any, url: string) => this.setState({ url })
        
    this.reload().then(() => 
      this.setState({ initialised: true
                    })
    )
  }

  reload = () =>
    this.request(Promise.all([ ServerApi.query.collectiveOrders()
                             , ServerApi.query.householdOrders()
                             , ServerApi.query.products()
                             , ServerApi.query.households()
                             , ServerApi.query.householdPayments()
                             ]))
    .then(([collectiveOrders, householdOrders, products, households, householdPayments]) => {
      this.setState({ collectiveOrders
                    , householdOrders
                    , products
                    , households
                    , householdPayments
                    })
    })

  request = <T extends {}>(p: Promise<T>) => {
    this.setState({ loading: true })
    p.then(_ => this.setState({ loading: false }))
     .then()
     .catch(err => {
       const apiError = err as ApiError
       console.log(err)
       this.setState({ loading: false
                     , error: apiError
                     })
     })

    return p
  }

  render() {
    return this.state.initialised
      ? this.body()
      : (
        <div>
          {!!this.state.loading && 
            <div className="h-screen flex items-center justify-center text-grey-light">
              <Icon type="loading" className="w-16 h-16 -mt-4 rotating fill-current" />
            </div>
          }
          {!!this.state.error && (
            <div>{this.state.error.error}: {this.state.error.message}</div>
          )}
        </div>
    )
  }

  body() {
    return this.router.resolve(this.state.url)
  }
}