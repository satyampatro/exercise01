# Matic.network assignment
An api to fetch user transactions from etherum node hosted on infura's Kovan testnet.


#### Step1: Configure following env variables

KOVAN_TESTNET_ENDPOINT = [with the kovan test net api end point]

MONGO_DB_URL = [mongo db url]

DB_NAME = [mongo db name we are saving the documents into]

#### Step 2: Run local server - 

- run 'npm run dev' to start local server

#### Step 3: To fetch user transactions 

call api end point 'POST: http://localhost:3245/user_txs' with following params

`
{
	"address": "0xb1988ea4ebdc846f44b7c36e5c8558ff459398ae", // <- user address example
	"pageSize": 50,
	"pageNumber": 1
}
`


