module event_nft::event {
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::event as sui_event;
    use sui::vec_map::{Self, VecMap};
    use sui::vec_set::{Self, VecSet};
    use event_nft::nft::{Self, EventNFT};

    /// エラーコード
    const EEventNotFound: u64 = 0;
    const EInvalidPassphrase: u64 = 1;
    const EMintLimitReached: u64 = 2;
    const EEventExpired: u64 = 3;
    const EEventNotStarted: u64 = 4;
    const EAlreadyMinted: u64 = 5;
    const EInvalidCreator: u64 = 6;

    /// イベント情報を管理するストラクチャ
    struct EventManager has key {
        id: UID,
        /// 所有者
        owner: address,
        /// 登録されたイベントのマップ（ID -> Event）
        events: Table<ID, Event>,
        /// 合言葉からイベントIDへのマップ
        passphrase_to_event: VecMap<String, ID>,
    }

    /// イベント情報
    struct Event has store {
        id: UID,
        /// イベント名
        name: String,
        /// イベント詳細
        details: String,
        /// イベント作成者
        creator: address,
        /// ミント開始日時（ミリ秒）
        start_date: u64,
        /// ミント終了日時（ミリ秒）
        end_date: u64,
        /// NFTミント上限（0は無制限）
        mint_limit: u64,
        /// 現在のミント数
        mint_count: u64,
        /// NFT名
        nft_name: String,
        /// NFT説明
        nft_description: String,
        /// NFT画像URL
        nft_image_url: String,
        /// ミント済みウォレットのセット
        minted_wallets: VecSet<address>,
        /// ガス代肩代わりするかどうか（フェーズ3で実装）
        gas_sponsored: bool,
        /// NFTの譲渡可能か
        transferable: bool,
        /// 合言葉
        passphrase: String,
    }

    /// イベント作成イベント
    struct EventCreated has copy, drop {
        event_id: ID,
        name: String,
        creator: address,
        start_date: u64,
        end_date: u64,
    }

    /// NFTミントイベント
    struct EventNFTMinted has copy, drop {
        event_id: ID,
        nft_id: ID,
        receiver: address,
        minted_at: u64,
    }

    // === 初期化 ===

    /// EventManagerを初期化する関数
    fun init(ctx: &mut TxContext) {
        let manager = EventManager {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            events: table::new(ctx),
            passphrase_to_event: vec_map::empty(),
        };

        transfer::share_object(manager);
    }

    // === イベント管理関数 ===

    /// 新しいイベントを作成する関数
    public entry fun create_event(
        manager: &mut EventManager,
        name: String,
        details: String,
        start_date: u64,
        end_date: u64,
        mint_limit: u64,
        gas_sponsored: bool,
        transferable: bool,
        nft_name: String,
        nft_description: String, 
        nft_image_url: String,
        passphrase: String,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let event_id = object::new(ctx);
        let id_copy = object::uid_to_inner(&event_id);

        let event = Event {
            id: event_id,
            name,
            details,
            creator,
            start_date,
            end_date,
            mint_limit,
            mint_count: 0,
            nft_name,
            nft_description,
            nft_image_url,
            minted_wallets: vec_set::empty(),
            gas_sponsored,
            transferable,
            passphrase,
        };

        // イベント情報をテーブルに追加
        table::add(&mut manager.events, id_copy, event);
        
        // 合言葉からイベントIDへのマッピングを追加
        vec_map::insert(&mut manager.passphrase_to_event, passphrase, id_copy);

        // イベント作成イベントを発行
        sui_event::emit(EventCreated {
            event_id: id_copy,
            name,
            creator,
            start_date,
            end_date,
        });
    }

    /// 合言葉からイベントを検証する関数（クライアント用）
    public fun verify_passphrase(
        manager: &EventManager,
        passphrase: String,
        ctx: &TxContext
    ): bool {
        vec_map::contains(&manager.passphrase_to_event, &passphrase)
    }

    /// イベントに対してNFTをミントする関数
    public entry fun mint_event_nft(
        manager: &mut EventManager,
        event_id: ID,
        ctx: &mut TxContext
    ) {
        // イベントが存在するか確認
        assert!(table::contains(&manager.events, event_id), EEventNotFound);
        
        let event = table::borrow_mut(&mut manager.events, event_id);
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let sender = tx_context::sender(ctx);
        
        // ミント期間のチェック
        assert!(current_time >= event.start_date, EEventNotStarted);
        assert!(current_time <= event.end_date, EEventExpired);
        
        // ミント上限のチェック（limit=0は無制限）
        if (event.mint_limit > 0) {
            assert!(event.mint_count < event.mint_limit, EMintLimitReached);
        };
        
        // 重複ミントのチェック
        assert!(!vec_set::contains(&event.minted_wallets, &sender), EAlreadyMinted);
        
        // NFTを発行
        let nft = nft::mint_nft(
            event.nft_name,
            event.nft_description,
            event.nft_image_url,
            event_id,
            event.transferable,
            ctx
        );
        
        // ミント数と発行済みアドレスを更新
        event.mint_count = event.mint_count + 1;
        vec_set::insert(&mut event.minted_wallets, sender);
        
        // NFTをユーザーに転送
        let nft_id = object::id(&nft);
        transfer::public_transfer(nft, sender);
        
        // ミントイベントを発行
        sui_event::emit(EventNFTMinted {
            event_id,
            nft_id,
            receiver: sender,
            minted_at: current_time,
        });
    }

    /// 合言葉でイベントを検証してからNFTをミントする関数
    public entry fun verify_and_mint(
        manager: &mut EventManager,
        passphrase: String,
        ctx: &mut TxContext
    ) {
        // 合言葉からイベントIDを取得
        assert!(vec_map::contains(&manager.passphrase_to_event, &passphrase), EInvalidPassphrase);
        let event_id = *vec_map::get(&manager.passphrase_to_event, &passphrase);
        
        // イベントNFTをミント
        mint_event_nft(manager, event_id, ctx);
    }

    /// イベントを取得する関数（読み取り専用）
    public fun get_event(manager: &EventManager, event_id: ID): &Event {
        assert!(table::contains(&manager.events, event_id), EEventNotFound);
        table::borrow(&manager.events, event_id)
    }

    /// イベントの合言葉を検証する関数
    public fun is_valid_passphrase(manager: &EventManager, passphrase: String): bool {
        vec_map::contains(&manager.passphrase_to_event, &passphrase)
    }

    /// イベントのミント状況を確認する関数
    public fun has_minted(manager: &EventManager, event_id: ID, wallet: address): bool {
        if (!table::contains(&manager.events, event_id)) {
            return false
        };
        
        let event = table::borrow(&manager.events, event_id);
        vec_set::contains(&event.minted_wallets, &wallet)
    }

    // === アクセサ関数 ===
    
    public fun event_name(event: &Event): &String {
        &event.name
    }

    public fun event_details(event: &Event): &String {
        &event.details
    }

    public fun event_creator(event: &Event): address {
        event.creator
    }

    public fun event_start_date(event: &Event): u64 {
        event.start_date
    }

    public fun event_end_date(event: &Event): u64 {
        event.end_date
    }

    public fun event_mint_limit(event: &Event): u64 {
        event.mint_limit
    }

    public fun event_mint_count(event: &Event): u64 {
        event.mint_count
    }

    public fun event_nft_name(event: &Event): &String {
        &event.nft_name
    }

    public fun event_nft_description(event: &Event): &String {
        &event.nft_description
    }

    public fun event_nft_image_url(event: &Event): &String {
        &event.nft_image_url
    }

    public fun event_gas_sponsored(event: &Event): bool {
        event.gas_sponsored
    }

    public fun event_transferable(event: &Event): bool {
        event.transferable
    }
}