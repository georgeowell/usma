export type Product = { id: number
                      , name: string
                      , price: number
                      }

export type Household = { id: number
                        , name: string
                        }

export type CollectiveOrder = { id: number
                              , createdDate: Date
                              , isComplete: boolean
                              , isCancelled: boolean
                              , isOpen: boolean
                              , isPlaced: boolean
                              , isPast: boolean
                              , total: number
                              , items: OrderItem[]
                              }

export type HouseholdOrder = { orderId: number
                             , orderCreatedDate: Date
                             , isOrderPlaced: boolean
                             , isOrderPast: boolean
                             , householdId: number
                             , householdName: string 
                             , isComplete: boolean
                             , isCancelled: boolean
                             , isOpen: boolean
                             , total: number
                             , items: OrderItem[]
                             }

export type OrderItem = { productId: number
                        , productName: string
                        , itemQuantity: number
                        , itemTotal: number
                        }

export type HouseholdPayment = { id: number 
                               , householdId: number
                               , date: Date
                               , amount: number
                               }