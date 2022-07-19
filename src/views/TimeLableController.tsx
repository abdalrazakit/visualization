import {FC, useEffect} from "react";
import React from "react";
import neo4j from "neo4j-driver";
import {toNumber} from "lodash";

const TimeLabelController: FC<{ setTimesLabels: (timeDataSet: any[]) => void, }> =
    ({setTimesLabels, children}) => {

        useEffect(() => {
            const neo4j = require('neo4j-driver')


            const uri = 'neo4j+s://007b1fbe.databases.neo4j.io';
            const user = 'neo4j';
            const password = 'xmbWBeAWjqbut2-S2mkW7N3h42Uu5BkvfO9WM5pb4R8';
            var driver = neo4j.driver(uri, neo4j.auth.basic(user, password),  { disableLosslessIntegers: true })
            var session = driver.session();

            const getData = async () => {
                await driver.session().run("MATCH (n) return  DISTINCT n.from AS date union MATCH (n) where not n.end=0 return DISTINCT n.end AS date"
                    , {})
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

