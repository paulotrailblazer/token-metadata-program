import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
const data = require("../config/metadata.json");

export function loadWalletKey(keypairFile: string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}

async function main() {

    console.log("Updating metadata for existing metadata account")
    const myKeypair = loadWalletKey("C:/Users/profe/.config/solana/id.json");
    console.log(myKeypair.publicKey.toBase58());
    const mint = new web3.PublicKey("HARcNpSQ5zZ2dCci2bg91w9K4pkv222mS9fQMKwQBpxe");
    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode('metadata'));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);

    const accounts: mpl.UpdateMetadataAccountV2InstructionAccounts = {
        metadata: metadataPDA,
        updateAuthority: myKeypair.publicKey,
    }

    const dataV2:mpl.DataV2 = {
        name: data.name,
        symbol: data.symbol,
        uri: data.uri,
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,



    }
    const args: mpl.UpdateMetadataAccountV2InstructionArgs = {
        updateMetadataAccountArgsV2:
        {
            data:
                dataV2,
            isMutable: true,
            updateAuthority: myKeypair.publicKey,
            primarySaleHappened: false
        }
    };
    console.log("Update data: ", JSON.stringify(args));
    const ci = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);
    const tx = new web3.Transaction();
    tx.add(ci);
    const connection = new web3.Connection("https://api.mainnet-beta.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log("Signed transactions response", txid);
    console.log("done");
}

main()
