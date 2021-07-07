let baseUrl = "http://localhost:3021"

window.addEventListener('load', (event) => {
    // SC invocation variables
    let { CONST, wallet, api, u, rpc } = Neon
    const rpcClient = new rpc.RPCClient('https://testnet2.neo.coz.io:443');
    let networkMagic = 844378958
    let scriptHash = "0xefeb7fa101996240a35a88f388407f0027ce02e4"
    let rpcAddress = "https://testnet2.neo.coz.io:443";


    // account
    let account
    let users = []
    let user
    let neoBalance = 0
    let gasBalance = 0
    let neoFsBalance = 0


    // CHECK IF USER IS LOGGED IN

    //   CHECK IF USER HAS AN ACCOUNT







    // INITIALIZE

    async function initialize() {
        if (typeof (Storage) !== "undefined") {
            // Store
            account = JSON.parse(localStorage.getItem("account"))
            // console.log("account", account)
            if (account) {
                await getUser()
                await getNeoFsBalance()
                getAccountBalance().then(() => {
                    populateAccountFields()
                })

                populateUserProfile()


            } else {
                window.location.href = "index.html";
            }
        } else {
            window.location.href = "index.html";
        }
    }

    initialize()





    async function getAccountBalance() {
        let balanceResponse;
        const inputs = {
            fromAccount: new wallet.Account(
                account.address
            ),
        }
        try {
            balanceResponse = await rpcClient.execute(new rpc.Query({
                method: "getnep17balances",
                params: [inputs.fromAccount.address],
            }));
        } catch (e) {
            JSAlert.alert(e).dismissIn(1000 * 2);
            // console.log(e)
            // console.log(
                // "\u001b[31m  ✗ Unable to get balances as plugin was not available. \u001b[0m");
            return;
        }
        // Check for token funds
        const balances = balanceResponse['balance']
        for (let i = 0; i < balances.length; i++) {
            balances[i]['amount'] = parseInt(balances[i]['amount']) / (100000000)
            if (balances[i]['assethash'].includes(CONST.NATIVE_CONTRACT_HASH.GasToken)) {
                balances[i]['assetName'] = 'Gas'
                gasBalance = balances[i]['amount']
            } else if (balances[i]['assethash'].includes(CONST.NATIVE_CONTRACT_HASH.NeoToken)) {
                balances[i]['assetName'] = 'Neo'
                neoBalance = balances[i]['amount']
            }
        }
        // console.log(balances)
    }


    async function getNeoFsBalance() {
        let data = {
            WIF: account.WIF
        }
        await axios.post(`${baseUrl}/api/getBalance`, data).then(res => {
            if (!res.data.error) {
                // console.log('response', res.data)
                neoFsBalance = res.data.balance
                $('#neoFsBalance').html(neoFsBalance)

            }
        })
    }

    function populateAccountFields() {
        // console.log("here")
        $('#accountAddress').html(account.address)
        let containerID = account.user.container === "" ? "Please create a container" : account.user.container
        $('#containerID').html(containerID)
        $('#username').html(account.user.username)

        $('#neoBalance').html(neoBalance)
        $('#gasBalance').html(gasBalance)
        $('#neoFsBalance').html(neoFsBalance)
    }


    // GET USERS

    async function getUsers() {
        let args = []
        let operation = "getUsers";

        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
            }
        );

        let res
        try {

            res = await contract.testInvoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                })
            // console.log(res.state, res.gasconsumed, res.exception)
            if (res.stack) {
                // console.log('stack', res.stack[0].value[0].value)
                let data = res.stack[0].value

                for (let i = 0; i < data.length; i++) {
                    let d = data[i].value
                    // // console.log("d: ", d);
                    let value = u.HexString.fromBase64(d).toAscii()
                    let obj = JSON.parse(JSON.parse(value))
                    // console.log(obj)
                    users.push(obj)
                }
                getUserAccount()
                // console.log("users ", users, users.length)
            }


        } catch (e) {
            // console.log(e)
        }
        return res
    }

    async function getUser() {
        let args = [{ "type": "String", "value": account.address }]
        let operation = "getUser";

        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
            }
        );

        let res
        try {

            res = await contract.testInvoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                })
            // console.log(res.state, res.gasconsumed, res.exception)
            if (res.stack) {
                // console.log('stack', res.stack[0].value[0].value)
                let data = res.stack[0].value
                // console.log("data", data)

                user = JSON.parse(u.HexString.fromBase64(data).toAscii())
                // console.log('user retrieved: ', user)
                account.user =  user
                localStorage.setItem("account", JSON.stringify(account))
                // console.log("user found")
            }


        } catch (e) {
            // console.log(e)
        }
        return res
    }

    function getUserAccount() {
        for (let i = 0; i < users.length; i++) {
            if (users[i].address === account.address) {
                user = users[i]
                account.user =  user
                localStorage.setItem("account", JSON.stringify(account))
                // console.log("user found")
                break
            }
        }
    }

    function populateUserProfile() {
        // console.log(account)
        let value = account.user === undefined ? "" : account.user.username
        $('#inputUsername').attr("placeholder", value)
    }

    // COPY ADDRESS TO CLIPBOARD

    let btnCopy = document.getElementById('btnCopyAddress')
    btnCopy.addEventListener('click', function (e) {
        navigator.clipboard.writeText(account.address).then(res => {
            // console.log('success');
            JSAlert.alert("Link copied to clipboard").dismissIn(1000 * 2);;
        })
            .catch(error => {
                console.log(error)
            })
    })



    // FUND NEOFS ACCOUNT

    let btnFundAccount = document.getElementById('btnFund')
    btnFundAccount.addEventListener('click', async function (ev) {

        let amount = $('#neoFsAmount').val()
        $('#btnFund').attr('disabled', true)
        // console.log("fund account GAS", amount)

        if (gasBalance > amount) {
            $(this).html(
                `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                Funding...`
            );
            await fundNeoFSAccount(amount)
            $('#btnFund').attr('disabled', false)
            $(this).html("Fund");
        } else {
            $('#btnFund').attr('disabled', false)
            JSAlert.alert("you don't have enough gas").dismissIn(1000 * 3);
        }
    })


    async function fundNeoFSAccount(amount) {
        const facadePromise = Neon.api.NetworkFacade.fromConfig({
            node: 'https://testnet2.neo.coz.io:443',
        });
        const intent = {
            from: new Neon.wallet.Account(account.WIF),
            to: "NSEawP75SPnnH9sRtk18xJbjYGHu2q5m1W",
            decimalAmt: (amount),
            contractHash: Neon.CONST.NATIVE_CONTRACT_HASH.GasToken,
        };

        const signingConfig = {
            signingCallback: Neon.api.signWithAccount(
                new Neon.wallet.Account(account.WIF)
            ),
        };

        let result = await facadePromise
            .then((facade) => facade.transferToken([intent], signingConfig))
            .then((txid) => {
                // console.log('transaction id: ', txid)
                return txid
            })
            .catch((err) =>  console.log(err));
        if (result !== undefined) {
            setTimeout(() => {
                getNeoFsBalance()
            }, 2000);
            JSAlert.alert(`You have added ${amount} GAS to your NEOFS account.\n It make take a few seconds for it to reflect on your account`).dismissIn(1000 * 5);
        }
        // console.log("result", result)
    }


    // Create container
    async function createContainer() {
        let data = {
            WIF: account.WIF
        }
        await axios.post(`${baseUrl}/api/CreateContainer`, data)
            .then(async (res) => {
                if (!res.data.error) {
                    // console.log("containerID: ", res.data.containerID, " ---- ", account.user.container)
                    account.user.container = res.data.containerID
                    await editUser(account.WIF, account.user, account.address)
                    localStorage.setItem("account", JSON.stringify(account))
                    $('#containerID').html(account.user.container)

                } else {
                    // console.log("error: ", res.data.message)
                    JSAlert.alert(`Error while creating a container:\n ${res.data.message} `).dismissIn(1000 * 2);
                }
            })
            .catch(function (error) {
                // console.log("error: ", JSON.stringify(error))
            });
    }


    let btnCreateContainer = document.getElementById("btnCreateContainer")
    btnCreateContainer.addEventListener("click", async function (e) {
        if (neoFsBalance > 0) {
            $(this).attr('disabled', true)

            $(this).html(
                `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                Creating...`
            );
            await createContainer()
            $(this).attr('disabled', false)
            $(this).html("Create container");
        } else {
            JSAlert.alert("Please add some funds to your NeoFs account, before creating a container").dismissIn(1000 * 2);
        }
    })

    async function editUser(WIF, data, key) {
        let account = new Neon.wallet.Account(WIF)

        // console.log("account", account)

        // console.log(data)
        let args = [{ "type": "String", "value": JSON.stringify(data) }, { "type": "String", "value": key }]
        // console.log("args: ", args)
        let operation = "editUser";

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

            JSAlert.alert("User edited successfully").dismissIn(1000 * 2);;

        } catch (e) {
            JSAlert.alert(`Error`, e).dismissIn(1000 * 2);;
            // console.log(e)
        }
        return res
    }




    // edit profile

    let form = document.getElementById('formProfileSettings');
    form.addEventListener('submit', async function (event) {
        event.preventDefault()
        $("#btnChangeUsername").attr('disabled', true)

        let usernameInput = $('#inputUsername').val()
        account.user.username = usernameInput

        $("#btnChangeUsername").html(
            `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
            Changing...`
        )

        try {
            await editUser(account.WIF, account.user, account.address)
            $('#username').html(account.user.username)
            $("#btnChangeUsername").attr('disabled', false)
            $("#btnChangeUsername").html("Change username")
            localStorage.setItem("account", JSON.stringify(account))
        } catch (error) {
            $("#btnChangeUsername").attr('disabled', false)
            $("#btnChangeUsername").html("Change username")
        }
    })




    // window.onbeforeunload = function() {
    //     localStorage.removeItem("account");
    //     // console.log("storage cleared")
    //     return '';
    //   };



});

