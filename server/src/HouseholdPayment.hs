{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE StandaloneDeriving #-}

module HouseholdPayment where
  import Data.Aeson
  import GHC.Generics
  import Data.Time.Calendar (Day)
  
  data HouseholdPayment = HouseholdPayment { id :: Int
                                           , householdId :: Int
                                           , date :: Day
                                           , amount :: Int
                                           } deriving (Eq, Show, Generic)
  instance ToJSON HouseholdPayment