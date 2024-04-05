import { IExecDataProtector } from "@iexec/dataprotector";
import { IExecWeb3mail } from "@iexec/web3mail";
import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import AsyncGrantedAccessFetcher from "@/components/grantAccess";

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
          // Assuming chainId 0x86 is equivalent to 134 in decimal
          console.log("Chain ID matches the desired value (134)");
          // Perform further actions, such as navigating or switching to the desired blockchain
        } else {
          console.log("Chain ID does not match the desired value (134)");
          // Perform other actions if needed
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      console.error("MetaMask extension not detected");
    }
  }

  const handleProtectMail = async () => {
    try {
      const dataProtector = new IExecDataProtector(web3Provider);

      const protectedData = await dataProtector.protectData({
        data: {
          email: email,
        },
      });

      const res = await axios.post(
        "http://localhost:5001/store-protectedData",
        {
          protectedData: protectedData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        setEmail("");
      } else {
        alert("Server error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Unable to run: handleProtectMail", error);
    }
  };
  const handleGrantAccess = async () => {
    try {
      const dataProtector = new IExecDataProtector(window.ethereum);
      npm;

      // TODO:
      // tried to give access to all addresses by giving 0x00000000000000000000000000000000000000 to both authorizedApp & authorizedUser but giving error
      // Need to check
      const grantedAccess = await dataProtector.grantAccess({
        protectedData: protectedAddress,
        authorizedApp: "0x00000000000000000000000000000000000000",
        authorizedUser: "0x00000000000000000000000000000000000000",
      });

      if (
        grantedAccess.workerpoolrestrict ==
        "0x00000000000000000000000000000000000000"
      ) {
        alert("Given Access to Public");
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
      console.error("Unable to run: handleGrantAccess", error);
    }
  };

  // Define the emailChange function
  function emailChange(event) {
    // Retrieve the email value from the input field
    const emailValue = event.target.value;
    // You can set the email value to state here if needed
    setEmail(emailValue);
  }
  function protectedAddressChange(event) {
    // Retrieve the email value from the input field
    const addressValue = event.target.value;
    // You can set the email value to state here if needed
    setProtectedAddress(addressValue);
  }

  const fetchYourData = async () => {
    try {
      // const web3mail = new IExecWeb3mail(web3Provider);
      // const contactsList = await web3mail.fetchMyContacts();
      const dataProtector = new IExecDataProtector(window.ethereum);
      const listProtectedData = await dataProtector.fetchProtectedData({
        owner: address,
      });
      setUserData(listProtectedData);
      // setUserData((prevData) => ({
      //   ...prevData,
      //   listProtectedData
      // }));
      // console.log("user data is: ", userData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // const fetchGrantedAccess = async (dataAddress) => {
  //   try {
  //     const listGrantedAccess = await dataProtector.fetchGrantedAccess({
  //       protectedData: dataAddress,
  //     });
  //     const countForAddress = await listGrantedAccess.count;
  //     console.log("count is:", countForAddress);
  //     if (countForAddress > 0) {
  //       return countForAddress;
  //     }
  //     return 0;
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  useEffect(() => {
    connectWallet();
    fetchYourData();
    setEmail("");
  }, [address]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {address.length === 0 ? (
            <button
              id="connectWalletButton"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleProtectMail()}
              >
                Submit
              </button>
            </div>
            <div className="flex flex-col">
              <input
                type="string"
                placeholder="Protected Address"
                id="protectedAddress"
                className="text-black rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                onChange={protectedAddressChange}
              />
              <button
                id="submitProtectedAddressButton"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => handleGrantAccess()}
              >
                Grant Access to Data
              </button>
            </div>
            {/* Mail Content form */}
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Protected Data"
                id="protectedData"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
              />
              <input
                type="text"
                placeholder="Email Subject"
                id="emailSubject"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
              />
              <input
                type="text"
                placeholder="Email Content"
                id="emailContent"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
              />
              <button
                id="sendMailButton"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
      </div>
    </div>
  );
}
