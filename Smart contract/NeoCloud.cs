using System;
using System.ComponentModel;
using Neo.SmartContract.Framework;
using Neo.SmartContract.Framework.Services;
using Neo.SmartContract.Framework.Native;

using Neo;
using Neo.SmartContract;


using System.Numerics;


namespace NeoCloud
{
    [DisplayName("NeoCloud")]
    [ManifestExtra("Author", "CSFM1993")]
    [ManifestExtra("Email", "csfm1993@gmail.com")]
    [ManifestExtra("Description", "This is a demo that shows how we could use NeoFs tou build an Imgur clone")]
    public class NeoCloud : SmartContract
    {
        [InitialValue("NYzmT4uPkQuCXoiF3jsNXspxw9RGjXmjxU", ContractParameterType.Hash160)]
        private static UInt160 Owner = default;


        private static bool IsOwner() => Runtime.CheckWitness(Owner);


        public static bool Verify() => IsOwner();


        public static bool initDB()
        {
            if (!IsOwner()) throw new Exception("No authorization.");

            StorageMap users = new StorageMap(Storage.CurrentContext, "users");
            StorageMap posts = new StorageMap(Storage.CurrentContext, "posts");

            // String usr1 = "{\"username\":\"csfm1993\",\"address\":\"NYzmT4uPkQuCXoiF3jsNXspxw9RGjXmjxU\",\"profileImage\":\"7wu2RLw9aaHLwEPZdZo3RXSL4AkGs4d2rJPUMa17N84v/FG3LDP728DzJH3bLyzbtYFmcmHCAmXWFrngzw3GCyTPR\",\"container\":\"7wu2RLw9aaHLwEPZdZo3RXSL4AkGs4d2rJPUMa17N84v\"}";
            String pst1 = "{\"title\":\"Testing init\",\"file\":\"7wu2RLw9aaHLwEPZdZo3RXSL4AkGs4d2rJPUMa17N84v/FG3LDP728DzJH3bLyzbtYFmcmHCAmXWFrngzw3GCyTPR\",\"userAddress\":\"NYzmT4uPkQuCXoiF3jsNXspxw9RGjXmjxU\",\"fileType\":\"image\"}";

            // users.Put("NYzmT4uPkQuCXoiF3jsNXspxw9RGjXmjxU", usr1);
            posts.Put("pst1111", pst1);

            return true;
        }


        public static string getInvoker()
        {
            var tx = (Transaction)Runtime.ScriptContainer;
            var address = StdLib.Base58CheckEncode("5" + (ByteString)tx.Sender);
            Runtime.Log(address);
            return (address);
        }


        public static List<String> getUsers()
        {
            var iter = Storage.Find(Storage.CurrentContext, "users", FindOptions.ValuesOnly);
            List<String> users = new List<String>();

            while (iter.Next())
            {
                String user = StdLib.JsonSerialize(iter.Value);
                users.Add(user);
            }

            return users;
        }


        public static String getUser(String key)
        {
            StorageMap users = new StorageMap(Storage.CurrentContext, "users");
            String user = users.Get(key);
            return user;
        }


        public static String addUser(string data, string key)
        {
            StorageMap users = new StorageMap(Storage.CurrentContext, "users");
            String contractInvoker = getInvoker();
            if (contractInvoker.Equals(key))
            {
                users.Put(key, data);
                return "Authorized " + contractInvoker;
            }
            else
            {
                return "Not Authorized";
            }
        }


        public static String editUser(string data, string key)
        {
            StorageMap users = new StorageMap(Storage.CurrentContext, "users");
            String contractInvoker = getInvoker();
            if (contractInvoker.Equals(key))
            {
                users.Put(key, data);
                return "Authorized " + contractInvoker;
            }
            else
            {
                return "Not Authorized";
            }
        }


        public static List<String> getPosts()
        {
            var iter = Storage.Find(Storage.CurrentContext, "posts");
            List<String> posts = new List<String>();

            while (iter.Next())
            {
                String post = StdLib.JsonSerialize(iter.Value);
                posts.Add(post);
            }
            return posts;
        }


        public static String getPost(String key)
        {
            StorageMap posts = new StorageMap(Storage.CurrentContext, "posts");
            String post = posts.Get(key);
            return post;
        }


        public static String addPost(string data, string key)
        {
            StorageMap posts = new StorageMap(Storage.CurrentContext, "posts");
            String contractInvoker = getInvoker();
            Map<String, String> post = (Map<String, String>)StdLib.JsonDeserialize(data);
            if (post.HasKey("userAddress"))
            {
                String userAddress = post["userAddress"];
                if (userAddress.Equals(contractInvoker))
                {
                    posts.Put(key, data);
                    return "Authorized " + contractInvoker;
                }
                else
                {
                    return "Not Authorized";
                }
            }
            else
            {
                return "Not found";

            }
        }


        public static String editPost(string data, string key)
        {
            StorageMap posts = new StorageMap(Storage.CurrentContext, "posts");
            String contractInvoker = getInvoker();
            var pst = (String)posts.Get(key);
            Map<String, String> post = (Map<String, String>)StdLib.JsonDeserialize(pst);
            if (post.HasKey("userAddress"))
            {
                String userAddress = post["userAddress"];
                if (userAddress.Equals(contractInvoker))
                {
                    posts.Put(key, data);
                    return "Authorized " + contractInvoker;
                }
                else
                {
                    return "Not Authorized";
                }
            }
            else
            {
                return "Not found";
            }
        }


        public static String deletePost(string key)
        {
            StorageMap posts = new StorageMap(Storage.CurrentContext, "posts");
            String contractInvoker = getInvoker();
            var pst = (String)posts.Get(key);
            Map<String, String> post = (Map<String, String>)StdLib.JsonDeserialize(pst);
            if (post.HasKey("userAddress"))
            {
                String userAddress = post["userAddress"];
                if (userAddress.Equals(contractInvoker))
                {
                    posts.Delete(key);
                    return "Authorized " + contractInvoker;
                }
                else
                {
                    return "Not Authorized";
                }
            }
            else
            {
                return "Not found";
            }
        }


        public static void Update(ByteString nefFile, string manifest)
        {
            if (!IsOwner()) throw new Exception("No authorization.");
            ContractManagement.Update(nefFile, manifest, null);
        }
    }
}

