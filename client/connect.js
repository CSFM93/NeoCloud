
window.addEventListener('load', (event) => {
    localStorage.removeItem("account")


    // console.log('connect.html')
    let { CONST, wallet, api, u, rpc } = Neon
    const rpcClient = new rpc.RPCClient('https://testnet2.neo.coz.io:443');
    let networkMagic = 844378958
    let scriptHash = "0xefeb7fa101996240a35a88f388407f0027ce02e4"
    let rpcAddress = "https://testnet2.neo.coz.io:443";


    let form = document.getElementById('formWalletConnect');
    form.addEventListener('submit', async function (event) {
        event.preventDefault()
        $('#btnConnect').attr('disabled', true)
        $('#btnConnect').html(
            `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
            Connecting...`
        );

        let WIF = $('#inputWalletWIF').val()
        // console.log('WIF', WIF)
        let accountAddress = await getAccountAddress(WIF)

        if (accountAddress !== undefined) {
            await saveAccount(WIF, accountAddress)
            $('#btnConnect').attr('disabled', false)
            $('#btnConnect').html("Connect");
        } else {
            JSAlert.alert("Please enter a valid key").dismissIn(1000 * 2);;
            $('#btnConnect').attr('disabled', false)
            $('#btnConnect').html("Connect");
        }

        clearWalletFormFields()
    })


    function clearWalletFormFields() {
        $('#inputWalletWIF').val('')
    }

    async function getAccountAddress(WIF) {
        try {
            let account = await new Neon.wallet.Account(WIF)
            // console.log(account.address, "\n", account.WIF)
            return account.address
        } catch (error) {
            // console.log("error:", error)
            return undefined
        }

    }



    async function createUser(WIF, data, key) {
        let account = new Neon.wallet.Account(WIF)

        // console.log("account", account)

        // console.log(data)
        let args = [{ "type": "String", "value": JSON.stringify(data) }, { "type": "String", "value": key }]
        // console.log("args: ", args)
        let operation = "addUser";

        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
                account
            }
        );

        let res
        try {
            res = await contract.invoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                    JSAlert.alert(`Error`, err).dismissIn(1000 * 2);;

                })
            // console.log('success', res)

            JSAlert.alert("User created successfully").dismissIn(1000 * 2);;

        } catch (e) {
            JSAlert.alert(`Error`, e).dismissIn(1000 * 2);;
            // console.log(e)
        }
        return res
    }



    async function getUser(WIF, address) {
        let args = [{ "type": "String", "value": `${address}` }];
        let operation = "getUser";

        let account = new Neon.wallet.Account(WIF)
        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
                account
            }
        );

        let res
        try {

            res = await contract.testInvoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                    return ''
                })
            // console.log(res.state, res.gasconsumed, res.exception)
            if (res.stack) {
                // // console.log('stack: ', res.stack[0])
                if (res.stack[0].value) {
                    let data = res.stack[0].value
                    let value = u.HexString.fromBase64(data).toAscii()
                    // // console.log('res: ', value)
                    let user = JSON.parse(value)
                    // console.log('user: ', user)
                    return user

                } else {
                    // console.log("is empty")
                    return ''
                }
            }


        } catch (e) {
            // console.log(e)
            return ''
        }

    }




    async function saveAccount(WIF, accountAddress) {


        let user = await getUser(WIF, accountAddress)
        // console.log("user data is: ", user)

        if (user !== "") {
            let userData = user
            // console.log("user found", userData)


            if (typeof (Storage) !== "undefined") {
                let account = {
                    address: accountAddress,
                    WIF: WIF,
                    user: userData
                }
                // Store
                // await createUser(WIF,userData,accountAddress)

                localStorage.setItem("account", JSON.stringify(account))
                JSAlert.alert("Account saved successfully").dismissIn(1000 * 2);
                setTimeout(() => {
                    window.location.href = "account.html";
                }, 2000);
            }

        } else {
            // console.log("user not found")

            let initialData = {
                username: accountAddress,
                address: accountAddress,
                profileImage: "7wu2RLw9aaHLwEPZdZo3RXSL4AkGs4d2rJPUMa17N84v/6V6B3vypgyWNedSRjw4VzZwUH4oZf3QeBJP3R79rtsKt",
                container: ""
            }

            await createUser(WIF, initialData, accountAddress)

            let account = {
                address: accountAddress,
                WIF: WIF,
            }
            // Store
            // await createUser(WIF,userData,accountAddress)

            localStorage.setItem("account", JSON.stringify(account))
            JSAlert.alert("Redirecting please wait").dismissIn(1000 * 7);
            setTimeout(() => {
                window.location.href = "account.html";
            }, 7000);
        }
    }



})