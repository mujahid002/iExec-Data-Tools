import { IExecDataProtector } from "@iexec/dataprotector";
import { IExecWeb3mail } from "@iexec/web3mail";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import AsyncGrantedAccessFetcher from "@/components/grantAccess";
import AsyncFetchContacts from "@/components/fetchContacts";

export default function Home() {
  const [address, setAddress] = useState("");
  const [web3Provider, setWeb3Provider] = useState(null);
  const [email, setEmail] = useState("");
  const [protectedAddress, setProtectedAddress] = useState("");
  const [userData, setUserData] = useState([]);

  // Function to connect to MetaMask wallet
  async function connectWallet() {
    if (window.ethereum) {
      try {
        // Requesting accounts from MetaMask
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        // Updating address variable with the first account
        setAddress(accounts[0]);

        // Setting web3Provider state to the window.ethereum object
        setWeb3Provider(window.ethereum);

        console.log("Connected to wallet");

        // Get the chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // Check if the chain ID matches the desired value
        if (chainId === "0x86") {
          // Chain ID matches the desired value (0x86)
          console.log("Chain ID matches the desired value (134)");
          // Perform further actions, such as navigating or switching to the desired blockchain
        } else {
          // Chain ID does not match the desired value (0x86)
          console.log("Chain ID does not match the desired value (134)");

          // Switching the chain to 0x86
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x86" }], // Chain ID 0x86 (134 in decimal)
            });
            console.log("Switched to chain ID 0x86 (134)");
            // Perform further actions after switching
          } catch (switchError) {
            // Handle error during chain switching
            console.error("Error switching chain:", switchError);
          }
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      console.error("MetaMask extension not detected");
    }
  }

  // * Uses protectData Method
  const handleProtectMail = async () => {
    try {
      if (isValidEmail(email)) {
        const res = window.confirm(`Are you sure you want to store ${email} ?`);
        if (res) {
          const dataProtector = new IExecDataProtector(web3Provider);

          const protectedData = await dataProtector.protectData({
            data: {
              email: email,
            },
          });
        } else {
          alert("Change Email address!");
        }
      } else {
        alert("Invalid email address");
      }

      // const res = await axios.post(
      //   "http://localhost:5001/store-protectedData",
      //   {
      //     protectedData: protectedData,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // if (res.status === 200) {
      //   setEmail("");
      // } else {
      //   alert("Server error occurred. Please try again later.");
      // }
    } catch (error) {
      console.error("Unable to run: handleProtectMail", error);
    }
  };

  // * uses grantAccess Method
  const handleGrantAccess = async () => {
    try {
      /***
       * TODO: For @param authorizedApp use 0x781482C39CcE25546583EaC4957Fb7Bf04C277D2 OR web3mail.apps.iexec.eth(web3 mail address)
       * ? About Address: 0x781482C39CcE25546583EaC4957Fb7Bf04C277D2 is an address for the whitelist, which is a list of addresses for different versions of the web3mail app. Whenever a new version of the web3mail dapp is deployed (which is rare),
       * ? the address of that new version is added to the whitelist. This ensures transparency for the builders, as they don't need to authorize the new version of the dapp to access their protected data : https://blockscout-bellecour.iex.ec/address/0x781482C39CcE25546583EaC4957Fb7Bf04C277D2
       * ? For Hackathon this 0x781482C39CcE25546583EaC4957Fb7Bf04C277D2 / web3mail.apps.iexec.eth will be enough and simple to use, if anyone wants to create Own web3Mail Dapp. We can create using "Scone Framework" with TEE, FYR: https://protocol.docs.iex.ec/for-developers/confidential-computing/create-your-first-sgx-app
       * TODO: For @param authorizedUser use 0x0000000000000000000000000000000000000000 to grant the data access publicly!
       * ! No update on TokenURI from the team, hope they will resolve this Issue ASAP!
       * */
      const dataProtector = new IExecDataProtector(window.ethereum);

      const grantedAccess = await dataProtector.grantAccess({
        protectedData: protectedAddress,
        authorizedApp: "0x781482C39CcE25546583EaC4957Fb7Bf04C277D2",
        authorizedUser: "0x0000000000000000000000000000000000000000",
      });

      if (
        grantedAccess.workerpoolrestrict ==
        "0x0000000000000000000000000000000000000000"
      ) {
        alert("Given Access to Public");
      }
    } catch (error) {
      console.error("Unable to run: handleGrantAccess", error);
    }
  };

  // * uses fetchProtectedData Method
  const fetchYourData = async () => {
    try {
      const dataProtector = new IExecDataProtector(window.ethereum);
      const listProtectedData = await dataProtector.fetchProtectedData({
        owner: address,
      });
      setUserData(listProtectedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // * uses fetchGrantedAccess Method
  const checkAccessToAll = async () => {
    try {
      const dataProtector = new IExecDataProtector(window.ethereum);
      const listGrantedAccess = await dataProtector.fetchGrantedAccess({
        protectedData: protectedAddress,
      });
      if (listGrantedAccess.grantedAccess[0] == undefined) {
        alert(`${protectedAddress} is a Private Data Address!`);
      }
      if (
        listGrantedAccess.grantedAccess[0].workerpoolrestrict ==
        "0x0000000000000000000000000000000000000000"
      ) {
        alert(`Publicly Access given to ${protectedAddress} Data Address!`);
      }
      document.getElementById("protectedData").value = "";

      setProtectedAddress("");
    } catch (error) {
      console.error("Error in running checkAccessToAll function:", error);
    }
  };

  // * uses revokeAllAccessObservable Method
  const handleRevokeAllAccess = async () => {
    try {
      const dataProtector = new IExecDataProtector(window.ethereum);

      const revokeAllAccessObservable = await dataProtector
        .revokeAllAccessObservable({
          protectedData: protectedAddress,
          // authorizedApp: "0x781482C39CcE25546583EaC4957Fb7Bf04C277D2",
          // authorizedUser: "0x0000000000000000000000000000000000000000",
        })
        .subscribe({
          next: (data) => {
            console.log("next", data);
          },
          error: (error) => {
            console.log("error", error);
          },
          complete: () => {
            alert("revokeAllAccess complete");
          },
        });

      document.getElementById("protectedData").value = "";
      setProtectedAddress("");
    } catch (error) {
      console.error("Unable to run: handleRevokeAllAccess", error);
    }
  };

  function isValidEmail(email) {
    // Regular expression pattern for validating email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Define the emailChange function
  function emailChange(event) {
    // Retrieve the email value from the input field
    const emailValue = event.target.value;
    // You can set the email value to state here if needed
    setEmail(emailValue);
    // console.log("the email is: ", email);
  }
  function protectedAddressChange(event) {
    // Retrieve the email value from the input field
    const addressValue = event.target.value;
    // You can set the email value to state here if needed
    setProtectedAddress(addressValue);
  }

  // const fetchMyContacts = async () => {
  //   try {
  //     const web3mail = new IExecWeb3mail(window.ethereum);
  //     const contactsList = await web3mail.fetchMyContacts();
  //     setContactsData(contactsList);
  //   } catch (error) {
  //     console.error("Unabe to run fetchMyContacts", error);
  //   }
  // };
  const sendMail = async () => {
    // Get the values of address, subject, and content from the input fields
    const protectedAddress = document.getElementById("protectedData").value;
    const subject = document.getElementById("emailSubject").value;
    const content = document.getElementById("emailContent").value;
    if (!address || !subject || !content) {
      alert("Please fill in all fields");
      return;
    }

    const web3mail = new IExecWeb3mail(window.ethereum);
    const sendEmail = await web3mail.sendEmail({
      protectedData: protectedAddress,
      emailSubject: subject,
      emailContent: content,
      contentType: "text/html",
      senderName: "Sent From GetBoarded",
    });

    // For demonstration purposes, let's just log the values to the console
    console.log("Address:", address);
    console.log("Subject:", subject);
    console.log("Content:", content);

    // Clear the input fields after sending the email
    document.getElementById("protectedData").value = "";
    document.getElementById("emailSubject").value = "";
    document.getElementById("emailContent").value = "";

    // Optionally, you can provide feedback to the user that the email has been sent
    alert("Email sent successfully", sendEmail.taskId);
  };

  useEffect(() => {
    connectWallet();
    fetchYourData();
    // fetchMyContacts();
    setEmail("");
  }, [address]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {address.length === 0 ? (
            <button
              id="connectWalletButton"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
              onClick={() => connectWallet()}
            >
              Connect Wallet
            </button>
          ) : (
            <p className="text-gray-700 text-lg">{address}</p>
          )}

          <span id="userAddress" className="text-gray-700 mb-4"></span>
          <div className="flex space-x-4">
            {/* Email form */}
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                id="email"
                className="text-black rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                onChange={emailChange}
              />
              <button
                id="submitEmailButton"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleProtectMail()}
              >
                Protect Data
              </button>
            </div>
            <div className="flex flex-col">
              <input
                type="string"
                placeholder="Protected Data Address"
                id="protectedAddress"
                className="text-black rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                onChange={protectedAddressChange}
              />
              <button
                id="submitProtectedAddressButton"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleGrantAccess()}
              >
                Grant Public Access to Data
              </button>
            </div>
            <div className="flex flex-col">
              <input
                type="string"
                placeholder="Protected Data Address"
                id="protectedAddress"
                className="text-black rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                onChange={protectedAddressChange}
              />
              <button
                id="submitProtectedAddressButton"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => checkAccessToAll()}
              >
                Check Public Access
              </button>
            </div>
            <div className="flex flex-col">
              <input
                type="string"
                placeholder="Protected Data Address"
                id="protectedAddress"
                className="text-black rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                onChange={protectedAddressChange}
              />
              <button
                id="submitProtectedAddressButton"
                className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleRevokeAllAccess()}
              >
                Revoke All Acceses
              </button>
            </div>
            {/* Mail Content form */}
            <div className="flex flex-col text-black">
              <input
                type="text"
                placeholder="Protected Data"
                id="protectedData"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <input
                type="text"
                placeholder="Email Subject"
                id="emailSubject"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <input
                type="text"
                placeholder="Email Content"
                id="emailContent"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <button
                id="sendMailButton"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => sendMail()}
              >
                Send Mail
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flex justify-center text-black">
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Data Addresses for {address}
                </th>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Access Count
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(userData) && userData.length > 0 ? (
                userData.map((data, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{data.address}</td>
                    <td className="border px-4 py-2">
                      <AsyncGrantedAccessFetcher dataAddress={data.address} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-4 py-2" colSpan="2">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-center text-black">
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Data Owners
                </th>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Data Addresses with Public Access
                </th>
              </tr>
            </thead>
            <AsyncFetchContacts />
          </table>
        </div>
      </div>
    </div>
  );
}
