import { NextResponse } from "next/server";

const CIRCLE_BASE_URL =
  process.env.NEXT_PUBLIC_CIRCLE_BASE_URL ?? "https://api.circle.com";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY as string;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body ?? {};

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    switch (action) {
      case "createDeviceToken": {
        const { deviceId } = params;
        if (!deviceId) {
          return NextResponse.json(
            { error: "Missing deviceId" },
            { status: 400 },
          );
        }

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/users/social/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
            },
            body: JSON.stringify({
              idempotencyKey: crypto.randomUUID(),
              deviceId,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "initializeUser": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 },
          );
        }

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/user/initialize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify({
              idempotencyKey: crypto.randomUUID(),
              accountType: "SCA",
              blockchains: ["ARC-TESTNET"],
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "listWallets": {
        const { userToken } = params;
        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 },
          );
        }

        const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/wallets`, {
          method: "GET",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
            "X-User-Token": userToken,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "contractExecution": {
        const {
          userToken,
          walletId,
          contractAddress,
          abiFunctionSignature,
          abiParameters,
          callData,
          feeLevel,
          amount,
        } = params;

        if (!userToken || !walletId || !contractAddress) {
          return NextResponse.json(
            { error: "Missing required fields for contractExecution" },
            { status: 400 },
          );
        }

        if (!abiFunctionSignature && !callData) {
          return NextResponse.json(
            { error: "Must provide abiFunctionSignature or callData" },
            { status: 400 },
          );
        }

        const execBody: Record<string, unknown> = {
          idempotencyKey: crypto.randomUUID(),
          walletId,
          contractAddress,
          feeLevel: feeLevel ?? "MEDIUM",
        };

        // callData and abiFunctionSignature are mutually exclusive
        if (callData) {
          execBody.callData = callData;
        } else {
          execBody.abiFunctionSignature = abiFunctionSignature;
          execBody.abiParameters = abiParameters ?? [];
        }

        if (amount !== undefined) {
          execBody.amount = String(amount);
        }

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/user/transactions/contractExecution`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify(execBody),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "queryContract": {
        const { address, blockchain, abiFunctionSignature, abiParameters, abiJson } = params;

        if (!address || !abiFunctionSignature) {
          return NextResponse.json(
            { error: "Missing required fields for queryContract" },
            { status: 400 },
          );
        }

        const queryBody: Record<string, unknown> = {
          address,
          blockchain: blockchain ?? "ARC-TESTNET",
          abiFunctionSignature,
          abiParameters: abiParameters ?? [],
        };

        if (abiJson) {
          queryBody.abiJson = abiJson;
        }

        console.log("[queryContract] request body:", JSON.stringify(queryBody, null, 2));

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/contracts/query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
            },
            body: JSON.stringify(queryBody),
          },
        );

        const data = await response.json();
        console.log("[queryContract] response:", response.status, JSON.stringify(data, null, 2));

        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "getTokenBalance": {
        const { userToken, walletId } = params;
        if (!userToken || !walletId) {
          return NextResponse.json(
            { error: "Missing userToken or walletId" },
            { status: 400 },
          );
        }

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/wallets/${walletId}/balances`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.log("Error in /api/endpoints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
