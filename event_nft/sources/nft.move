module event_nft::nft {
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::package;
    use sui::display;
    use sui::url::{Self, Url};
    use sui::event;

    /// NFTの識別タイプ
    struct EVENT_NFT has drop {}

    /// イベント参加証NFTの定義
    struct EventNFT has key, store {
        id: UID,
        /// NFTの名前
        name: String,
        /// NFTの説明
        description: String,
        /// 画像のURL
        image_url: Url,
        /// イベントID（イベント管理モジュールと紐付け）
        event_id: ID,
        /// 発行者
        creator: address,
        /// 発行日
        created_at: u64,
        /// 譲渡可能かどうか
        transferable: bool,
    }

    /// NFT発行イベント
    struct NFTMinted has copy, drop {
        object_id: ID,
        creator: address,
        owner: address,
        event_id: ID,
        name: String,
    }

    /// 譲渡イベント
    struct NFTTransferred has copy, drop {
        object_id: ID,
        from: address,
        to: address,
    }

    /// 初期化関数
    fun init(witness: EVENT_NFT, ctx: &mut TxContext) {
        // NFTのディスプレイ設定
        let publisher = package::claim(witness, ctx);
        let display = display::new<EventNFT>(&publisher, ctx);

        // NFTの表示設定
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{name}"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"{description}"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display, string::utf8(b"creator"), string::utf8(b"{creator}"));
        display::add(&mut display, string::utf8(b"event_id"), string::utf8(b"{event_id}"));

        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    /// NFTを発行する関数
    public fun mint_nft(
        name: String, 
        description: String, 
        image_url: String,
        event_id: ID,
        transferable: bool,
        ctx: &mut TxContext
    ): EventNFT {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        let nft = EventNFT {
            id: object::new(ctx),
            name,
            description,
            image_url: url::new_unsafe(string::to_ascii(image_url)),
            event_id,
            creator: sender,
            created_at: timestamp,
            transferable,
        };

        // イベントを発行
        event::emit(NFTMinted {
            object_id: object::id(&nft),
            creator: sender,
            owner: sender,
            event_id,
            name,
        });

        nft
    }

    /// NFTを転送する関数（譲渡可能な場合のみ）
    public entry fun transfer_nft(nft: EventNFT, recipient: address, _ctx: &mut TxContext) {
        assert!(nft.transferable, 0); // 譲渡可能な場合のみ許可
        let from = tx_context::sender(_ctx);
        let nft_id = object::id(&nft);
        
        // イベントを発行
        event::emit(NFTTransferred {
            object_id: nft_id,
            from,
            to: recipient,
        });
        
        transfer::public_transfer(nft, recipient);
    }

    /// NFT情報へのアクセサ関数
    public fun name(nft: &EventNFT): &String {
        &nft.name
    }

    public fun description(nft: &EventNFT): &String {
        &nft.description
    }

    public fun image_url(nft: &EventNFT): &Url {
        &nft.image_url
    }

    public fun event_id(nft: &EventNFT): &ID {
        &nft.event_id
    }

    public fun creator(nft: &EventNFT): address {
        nft.creator
    }

    public fun created_at(nft: &EventNFT): u64 {
        nft.created_at
    }

    public fun is_transferable(nft: &EventNFT): bool {
        nft.transferable
    }

    /// 現在の所有者がNFTを直接受け取るためのラッパー関数
    public entry fun mint_and_take(
        name: String, 
        description: String, 
        image_url: String,
        event_id: ID,
        transferable: bool,
        ctx: &mut TxContext
    ) {
        let nft = mint_nft(name, description, image_url, event_id, transferable, ctx);
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }
}