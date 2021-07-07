let { wallet, api, u } = Neon
window.addEventListener('load', (event) => {
    // SC invocation variables

    let account
    let posts
    let users
    let currentCol = 0


    // INITIALIZE

    if (typeof (Storage) !== "undefined") {
        // Store
        posts = JSON.parse(localStorage.getItem("filteredPosts"))
        users = JSON.parse(localStorage.getItem("users"))
        // console.log("filtered posts", posts)

        populatePage(posts)
    }


    //   CHECK IF USER HAS AN ACCOUNT

    function isUserLoggedIn() {
        if (typeof (Storage) !== "undefined") {
            // Store
            account = JSON.parse(localStorage.getItem("account"))
            if (account) {
                $("#profileOrSignIn").html(`<li class="nav-item dropdown " style="margin-right: 50px;">
                    <a class="nav-link dropdown-toggle" href="account.html" id="navbarDropdown" role="button"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="display: inline-block">
                        ${account.user.username} <img id="userProfileImage" src="https://http.fs.neo.org/${account.user.profileImage}"
                        alt="Avatar" class="user_avatar" style=" margin-left: 5px;display: inline-block">
                    </a>
                    <div class="dropdown-menu bg-dark " aria-labelledby="navbarDropdown" style="margin-left: 0px;">
                        <a id="btnPosts" class="dropdown-item" style="color: lightgray;" >Posts</a>
                        <a class="dropdown-item" style="color: lightgray;" href="account.html">Settings</a>
                        <a id="btnLogout" class="dropdown-item" style="color: lightgray;" >Logout</a>
                    </div>
                </li> `)
                if (account.user.container !== "") {
                    $("#navbarLeftSide").html(`<li class="nav-item" style="margin-right: 50px;"><button id="btnNewPost" class="btn btn-success" type="submit">New Post</button></li>`)
                }
                // console.log(account)

            } else {
                $("#profileOrSignIn").html(`<li class="nav-item" style="margin-right: 50px;">
                    <button  id="btnConnect" class="btn btn-success"  type="button" >Connect</button>
                </li>`)
            }

        }
    }

    isUserLoggedIn()

    function logOut() {
        // console.log("logout")
        localStorage.removeItem("account");
        window.location.href = "index.html";
    }

    function connect() {
        window.location.href = "connect.html";
    }


    let btnLogout = document.getElementById("btnLogout")
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            logOut()
        })

        let btnPosts = document.getElementById("btnPosts")
        btnPosts.addEventListener('click', function () {
            localStorage.setItem("filteredPosts", localStorage.getItem("userPosts"))
            localStorage.setItem("users", JSON.stringify(users))
            window.location.href = "filteredPosts.html";
        })

        let btnNewPost = document.getElementById("btnNewPost")
        if(btnNewPost){
            btnNewPost.addEventListener('click', function () {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("posts", JSON.stringify(posts))
                    localStorage.setItem("users", JSON.stringify(users))
                }
                window.location.href = "newPost.html";
            })
        }

    } else {
        let btnConnect = document.getElementById("btnConnect")
        btnConnect.addEventListener('click', function () {
            connect()
        })
    }



    async function populatePage(posts) {
        let h3PostCount = document.getElementById("nrOfPosts")
        h3PostCount.innerHTML = posts.length > 1 ? `${posts.length} posts found` : `${posts.length} post found`
        let columns = document.getElementsByClassName("column")
        for (let i = 0; i < posts.length; i++) {
            // // console.log("is empty")

            let post = posts[i]
            setTimeout(() => {

                if (columns[0].getElementsByClassName("card").length === 0) {
                    // console.log("column 0 its empty")
                    let div = document.createElement("div")
                    let contentVideo = `<video draggable="false" autoplay loop muted playsinline controls>
                <source src="https://http.fs.neo.org/${post.file}" type="video/mp4">
            </video>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let contentImg = `<img
                src="https://http.fs.neo.org/${post.file}"><img>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let media = post.fileType.includes("video") ? contentVideo : contentImg
                    div.classList = "card";
                    div.innerHTML = media
                    div.addEventListener("click", function (ev) {
                        viewPost(i)
                    })
                    columns[0].appendChild(div)
                    selectDiv(currentCol)

                } else {


                    let post = posts[i]
                    let div = document.createElement("div")
                    div.classList = "card";
                    let contentVideo = `<video draggable="false" autoplay loop muted playsinline>
                <source src="https://http.fs.neo.org/${post.file}" type="video/mp4">
            </video>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let contentImg = `<img
                src="https://http.fs.neo.org/${post.file}"><img>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let media = post.fileType.includes("video") ? contentVideo : contentImg
                    div.classList = "card";
                    div.innerHTML = media

                    div.addEventListener("click", function (ev) {
                        viewPost(i)
                    })
                    columns[currentCol].appendChild(div)
                    // console.log("column has children ")

                    selectDiv(currentCol)

                }
            }, 200);
        }

        function selectDiv() {
            // // console.log("before", currentCol)
            if (currentCol < 3) {
                currentCol += 1
            } else {
                currentCol = 0
            }
            // // console.log("after", currentCol)

        }
    }

    function clearPosts() {
        let columns = document.getElementsByClassName("column")
        for (let i = 0; i < columns.length; i++) {
            columns[i].innerHTML = ""
            // while (columns[i].firstChild) {
            // columns[i].firstChild.remove()
            // 
        }
    }





    // OPEN POST page

    function viewPost(i) {
        if (typeof (Storage) !== "undefined") {
            // Store
            localStorage.setItem("posts", JSON.stringify(posts))
            localStorage.setItem("users", JSON.stringify(users))
            localStorage.setItem("currentPost", JSON.stringify(i));
            // console.log("local storage", localStorage.getItem("posts"), localStorage.getItem("currentPost"))
            window.location.href = "post.html";
        }
    }































});

