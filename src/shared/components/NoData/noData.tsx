import Image from "next/image";
import React from "react";

import s from "./NoData.module.scss";

const NoData = () => {
  return (
    <tbody
      style={{
        display: "flex",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <tr>
        <td className={s.no_data}>
          <Image
            alt={"icon"}
            src="/assets/no_data.svg"
            width={78}
            height={80}
          />
          <p className={s.no_data_text}>No data</p>
        </td>
      </tr>
    </tbody>
  );
};

export default NoData;
