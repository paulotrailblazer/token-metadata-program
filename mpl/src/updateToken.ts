import {
    PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts,
    DataV2, UpdateMetadataAccountV2InstructionArgs, createUpdateMetadataAccountV2Instruction
} from "@metaplex-foundation/mpl-token-metadata";
import { Keypair, PublicKey, Connection, Transaction, sendAndConfirmTransaction, TransactionInstruction, clusterApiUrl } from "@solana/web3.js";
import { utils } from '@project-serum/anchor';
import data from "../config/config.json";

/**
 *
 * @param keypairFile : Keypair
 * @returns Keypair from file
 */
export function loadWalletKey(keypairFile: string): Keypair {
    const fs = require("fs");
    const loaded = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}

/**
* Run the script
*/
async function main() {
    console.log("Updating metadata for existing metadata account")
    const myKeypair = loadWalletKey("C:/Users/profe/.config/solana/id.json");
    console.log(myKeypair.publicKey.toBase58());
    const mint = new PublicKey("HARcNpSQ5zZ2dCci2bg91w9K4pkv222mS9fQMKwQBpxe");
    const seed1 = Buffer.from(utils.bytes.utf8.encode('metadata'));
    const seed2 = Buffer.from(PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = PublicKey.findProgramAddressSync([seed1, seed2, seed3], PROGRAM_ID);
    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
        metadata: metadataPDA,
        updateAuthority: myKeypair.publicKey,
    }
    /**
     * Data to update
     * @type {DataV2}
     */
    const dataV2: DataV2 = {
        name: data.name,
        symbol: data.symbol,
        uri: data.uri,
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
    }
    /**
     * Arguments for the instruction
     * @type {UpdateMetadataAccountV2InstructionArgs}
     */
    const args: UpdateMetadataAccountV2InstructionArgs = {
        updateMetadataAccountArgsV2:
        {
            data: dataV2,
            isMutable: true,
            updateAuthority: myKeypair.publicKey,
            primarySaleHappened: false
        }
    };

    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    let ci: TransactionInstruction = createUpdateMetadataAccountV2Instruction(accounts, args);
    let tx = new Transaction();
    tx.add(ci);

    /**
     * Send the transaction
     * @type {Promise<string>}
     * @returns Transaction id
     */
    sendAndConfirmTransaction(connection, tx, [myKeypair])
        .then(txid => {
            console.log("Transaction id: ", txid);
        }).catch(err => {
            console.log("Error: ", err);
        }).finally(() => {
            console.log("Done");
        });
}


main();