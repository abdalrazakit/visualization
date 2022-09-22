import {FC, useEffect} from "react";
import React from "react";
import neo4j from "neo4j-driver";
import {toNumber} from "lodash";
import {DataBase} from "../helpers/generateData";

const TimeLabelController: FC<{ setTimesLabels: (timeDataSet: any[]) => void, }> =
    ({setTimesLabels, children}) => {

        useEffect(() => {
            const neo4j = require('neo4j-driver')


            const database=new DataBase()
            const getData = async () => {
                await database.readQuery("MATCH (n) return  DISTINCT n.from AS date union MATCH (n) where (not n.end='0') and ( not n.end=0)  return DISTINCT n.end AS date"
                    )
                    .then((result) => {

                        const newArr = result.records.map((element, index) => {
                            if (element._fields[0])
                            {
                                if ( element._fields[0].high){
                                    debugger
                                }
                                return element._fields[0];

                            }
                        });

                        newArr.sort((first, second) => first - second);
                        setTimesLabels(newArr);
                       // console.log(newArr)
                    });

                await database.close()
            }
            getData();
        }, []);


        return <>{children}</>;
    };

export default TimeLabelController;

