import {FC, useEffect} from "react";
import React from "react";
import neo4j from "neo4j-driver";

const TimeLabelController: FC<{ setTimesLabels: (timeDataSet: any[]) => void, }> =
    ({setTimesLabels, children}) => {

        useEffect(() => {
            const neo4j = require('neo4j-driver')
            const uri = 'neo4j+s://001bf928.databases.neo4j.io';
            const user = 'neo4j';
            const password = '0KTmA258EX7WFm7HduJai55xfkfE1XDUHFbQbVzLV2k';

            var driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
            var session = driver.session();

            const getData = async () => {
                await driver.session().run("MATCH (n) return  DISTINCT n.from AS date union MATCH (n) where not n.end=0 return DISTINCT n.end AS date"
                    , {})
                    .then((result) => {

                        const newArr = result.records.map((element, index) => {
                            if (element._fields[0])
                            return element._fields[0].low ? element._fields[0].low : element._fields[0];
                        });
                        newArr.sort((first, second) => first[0] - second[0]);
                        setTimesLabels(newArr);
                    });

                await session.close();
                await driver.close()
            }
            getData();
        }, []);


        return <>{children}</>;
    };

export default TimeLabelController;

