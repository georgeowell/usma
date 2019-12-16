import * as React from 'react';

import { Household, HouseholdOrder, PastHouseholdOrder, CollectiveOrder, HouseholdPayment, ProductCatalogueEntry } from '../Types'
import { Money } from '../common/Money'
import { Router } from '../common/Router'
import { CurrentOrder } from '../components/CurrentOrderForHousehold'
import { PastHouseholdOrders } from '../components/PastHouseholdOrders'
import { HouseholdPayments } from '../components/HouseholdPayments'
import { Collapsible, CollapsibleState } from '../common/Collapsible'
import { RouterLink } from '../common/RouterLink'
import { EditHousehold } from '../components/EditHousehold'

export interface HouseholdPageProps { household: Household
                                    , currentOrder: CollectiveOrder | null
                                    , currentHouseholdOrder: HouseholdOrder | null
                                    , currentHouseholdOrders: HouseholdOrder[]
                                    , pastHouseholdOrders: PastHouseholdOrder[]
                                    , payments: HouseholdPayment[]
                                    , products: ProductCatalogueEntry[]
                                    , categories: string[]
                                    , brands: string[]
                                    , households: Household[]
                                    , request: <T extends {}>(p: Promise<T>) => Promise<T>
                                    , reload: () => Promise<void>
                                    , router: Router
                                    }
type Section = 'orders' | 'past-orders' | 'payments' | 'household'
export interface HouseholdPageState { collapsibleState: CollapsibleState
                                    }
export class HouseholdPage extends React.Component<HouseholdPageProps, HouseholdPageState> {  
  editHousehold: React.RefObject<EditHousehold>

  constructor(props: HouseholdPageProps) {
    super(props)

    this.state = { 
      collapsibleState: new CollapsibleState('orders', collapsibleState => this.setState({collapsibleState}))
    }

    this.editHousehold = React.createRef();
  }

  render() {
    return (
      <div className="bg-household-light min-h-screen">
        <Collapsible className="min-h-28"
                     collapsibleKey="household"
                     collapsibleState={this.state.collapsibleState}
                     onExpand={() => { if(this.editHousehold.current) { this.editHousehold.current.reset() } }}
                     onCollapse={() => { if(this.editHousehold.current) { this.editHousehold.current.blur() } }}
                     onExpanded={() => { if(this.editHousehold.current) { this.editHousehold.current.focus() } }}
                     header={
                       <div className="p-2 bg-household-light min-h-28">
                         <div className="bg-no-repeat w-16 h-16 absolute bg-img-household mt-2"></div>
                         <h2 className="leading-none ml-20 relative flex mt-2">
                           {this.props.household.name}
                         </h2>
                         <div>
                           <div className="ml-20 mt-1">
                             <RouterLink path="/households">Change household</RouterLink>
                           </div>
                           <div className="ml-20 text-lg mt-4"><strong>Contact:</strong> {this.props.household.contactName || 'none'}</div>
                         </div>
                       </div>
                     }>
          <EditHousehold ref={this.editHousehold}
                         {...this.props}
                         onConfirm={() => this.props.reload().then(this.state.collapsibleState.toggle('household'))}
                         onCancel={this.state.collapsibleState.toggle('household')} />
        </Collapsible>
        <CurrentOrder collapsibleKey="orders"
                      collapsibleState={this.state.collapsibleState}
                      {...this.props} />
        <PastHouseholdOrders collapsibleKey="past-orders"
                             collapsibleState={this.state.collapsibleState}
                             {...this.props} />
        <HouseholdPayments collapsibleKey="payments"
                           collapsibleState={this.state.collapsibleState}
                           readOnly={true}
                           {...this.props} />
        <div className="bg-household-light p-2 pl-20 text-black relative">
          <h3 className="mt-0 ml-2 flex justify-between">
            <span>Balance ({this.props.household.balance < 0? 'owing' : 'in credit' }):</span>
            <span className="text-right"><Money amount={this.props.household.balance} absolute /></span>
          </h3>
        </div>
      </div>
    )
  }
}