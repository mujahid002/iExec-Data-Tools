import { useEffect, useState } from "react";
import { IExecDataProtector } from "@iexec/dataprotector";

const AsyncGrantedAccessFetcher = ({ dataAddress }) => {
  const [grantedAccessCount, setGrantedAccessCount] = useState(null);

  const fetchGrantedAccess = async (dataAddress) => {
    try {
      const dataProtector = new IExecDataProtector(window.ethereum);

      const listGrantedAccess = await dataProtector.fetchGrantedAccess({
        protectedData: dataAddress,
      });
      const countForAddress = await listGrantedAccess.count;
      console.log("count is:", countForAddress);
      if (countForAddress > 0) {
        return countForAddress;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const count = await fetchGrantedAccess(dataAddress);
        setGrantedAccessCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dataAddress]);

  return <>{grantedAccessCount !== null ? grantedAccessCount : "Loading..."}</>;
};

export default AsyncGrantedAccessFetcher;
