import React, { useEffect, useState } from "react";
import Caver from "caver-js";

import Layout from "../components/layout";
import SEO from "../components/seo";

declare global {
    interface Window {
        klaytn: any;
    }
}

const index = () => {
    var [address, setAddress] = useState<any>("0x");
    var [check, setCheck] = useState<boolean>(false);
    const caver: any | null = typeof window != "undefined" ? new Caver(window.klaytn) : null;

    const connect = async () => {
        if (typeof window != "undefined") {
            if (typeof window != "undefined" && caver) {
                const accounts: string[] = await window.klaytn.enable();
                setAddress(accounts[0]);
            }
        }
    };

    useEffect(() => {
        connect();
    }, []);

    const [discord, setDiscord] = useState({} as any);
    let accessToken: any, tokenType: any;
    useEffect(() => {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        [accessToken, tokenType] = [fragment.get("access_token"), fragment.get("token_type")];
        const getDiscord = () => {
            fetch("https://discord.com/api/users/@me", {
                headers: {
                    authorization: `${tokenType} ${accessToken}`,
                },
            })
                .then((result) => result.json())
                .then((response) => {
                    setDiscord(response);
                })
                .catch(console.error);
        };

        if (accessToken) {
            getDiscord();
        }
    }, [address]);

    useEffect(() => {
        if (discord && `${address}` !== "0x" && !check) {
            setCheck(true);
            giveRole();
        }
    }, [discord]);

    const checkHolder = async () => {
        if (!caver) return false;

        const cont: any = new caver.klay.KIP17(process.env.GATSBY_ADDR);
        const balance = await cont.balanceOf(address);
        console.log(parseInt(balance));
        return parseInt(balance) > 0;
    };

    const giveRole = async () => {
        const Holder = await checkHolder();
        if (Holder) {
            const response = await fetch(`/api/verify?discord=${discord.id}&addr=${address}`);
            if (response.status !== 204) {
                alert("홀더 인증이 실패되었습니다. 로그아웃 이후 다시 시도해주세요.\nYou failed to verify as a holder. Logout and try it again");
            } else {
                alert("홀더 인증이 완료되었습니다. 디스코드로 돌아가 확인해보세요.\nYou successfully verified as a holder. Go back to Discord and check out");
            }
        } else {
            alert("보유하신 NFT가 없습니다.\nYou do not hold any NFT");
        }
    };

    return (
        <Layout>
            <SEO title="Holder" />
            <h1 style={{ marginLeft: "50px", marginTop: "50px" }}>{`Connected Wallet address: ${address}`}</h1>
        </Layout>
    );
};

export default index;
