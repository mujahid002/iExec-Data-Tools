import React, { useEffect, useState } from "react";
import { IExecWeb3mail } from "@iexec/web3mail";

const AsyncFetchContacts = () => {
  const [contactsData, setContactsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyContacts = async () => {
    try {
      const web3mail = new IExecWeb3mail(window.ethereum);
      const contactsList = await web3mail.fetchMyContacts();
      setContactsData(contactsList);
      setLoading(false);
    } catch (error) {
      console.error("Unable to run fetchMyContacts", error);
    }
  };

  useEffect(() => {
    fetchMyContacts();
  }, []);

  return (
    <tbody>
      {loading ? (
        <tr>
          <td className="border px-4 py-2" colSpan="2">
            Loading...
          </td>
        </tr>
      ) : contactsData.length > 0 ? (
        contactsData.map((data, index) => (
          <tr key={index}>
            <td className="border px-4 py-2">{data.owner}</td>
            <td className="border px-4 py-2">{data.address}</td>
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
  );
};

export default AsyncFetchContacts;
