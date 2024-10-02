
/// Module: write3
module write3::write3 {
    // 新语法
    // use std::vector;
    use sui::event;
    // use sui::object::{Self,UID,ID,uid_to_bytes};
    // use sui::transfer;
    // use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    use std::string::{Self,utf8,String};
    use std::ascii::{Self, String as TString};
    use sui::clock::{Self, Clock};
    use sui::table;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::bag::{Self,Bag};
    use std::type_name;
    use sui::dynamic_object_field as ofield;
    use sui::dynamic_field as field;
    //use hdmv::hdbase;
    use std::hash::sha2_256;
    use std::debug::{Self,print};

    const EAuthorBookNotEnough:u64 = 4000;
    const EAuthorNotAuthor:u64 = 4001;
    const ERR_HASALREADYCreated :u64 = 4002;

    // 作者登记结构体
    // 此结构体来存储作者房间的信息（共享对象）
    public struct AuthorRoom has key, store {
        id: UID,
        //creator: address,//创建者
        usrList: vector<address>,//addresses list
        authorList:table::Table<u64,Author>, // authors list
        starttime: u64,//设置为0
    }

    // 作者的信息结构体
    public struct Author has key,store {
        id: UID,
        idx:u64,
        username: vector<u8>,//作者名称
        useraddress:address, //作者地址
        st:u8,//状态
        banned: bool,
        rank: u64,
    }

    // 作者权限
    public struct AuthorCap has key,store {
        id: UID,
        uid : u64,
        book : u64,
        useraddress:address,
    }

     // 定义一个结构体来存储作品的信息
    public struct Work has key,store {
        id: UID,
        author_id: u64,
        title: vector<u8>,
        description: vector<u8>,
        created_at: u64,
        chapterList: table::Table<u64,Chapter>,
        count:u64,
    }

    // 定义一个结构体来存储章节的信息
    public struct Chapter has key ,store{
        id: UID,
        title: vector<u8>,
        content: vector<u8>,
        blobid : vector<u8>,
        created_at: u64,
    }

    //admin
    public struct Write3AdminCap has key,store{
        id:UID, //object id
    }

    //register
    public struct Write3RegisterCap has key,store{
        id:UID, //object id
    }

    //events
    public struct AuthorRoomCreateEvent has copy, drop {
        id: ID,
    }

    //otw
    public struct WRITE3 has drop{} 

    //初始化作者集合
    #[allow(unused_function)]
    fun init(otw:WRITE3,ctx:&mut TxContext){
      let id = object::new(ctx);
      let eid = object::uid_to_inner(&id);
      let authorRoom  = AuthorRoom{
        id ,
        usrList : vector::empty<address>() ,
        authorList:table::new(ctx),
        starttime : 0
      };

      transfer::public_share_object(authorRoom);

      event::emit(AuthorRoomCreateEvent{
            id:eid,
      });

      let admin = tx_context::sender(ctx);
      let nowAdmin = Write3AdminCap{
            id:object::new(ctx),
      };
      transfer::transfer(nowAdmin,admin);
    }

    // 作者注册申请待批准 
    public entry fun createAuthor(room:&mut AuthorRoom, username: vector<u8>, banned: bool, rank: u64, ctx: &mut TxContext) {
        let user = tx_context::sender(ctx);
        assert!(!vector::contains(&room.usrList, &user), ERR_HASALREADYCreated);

        let id = object::new(ctx);
        let nowCount = vector::length(&room.usrList);
        let author = Author { 
          id, 
          idx:nowCount,
          username, 
          useraddress:user,
          st:0,//申请状态
          banned, 
          rank };

        //user No.
        
        vector::push_back(&mut room.usrList,user);
        table::add(&mut room.authorList,nowCount,author);   
    }

    //批准作者 
    public entry fun approveAuthor(_:&Write3AdminCap,room:&mut AuthorRoom,uIdx:u64, ctx: &mut TxContext){
      let author = table::borrow_mut(&mut room.authorList,uIdx);
      author.st = 1u8; //通过

      let id = object::new(ctx);
      let authorcap = AuthorCap{
        id,
        uid:uIdx,
        book:1,
        useraddress:author.useraddress
      };

      transfer::transfer(authorcap,author.useraddress);
    }

    // 封禁作者
    public entry fun banAuthor(_:&Write3AdminCap,room:&mut AuthorRoom,uIdx:u64) {
      let author = table::borrow_mut(&mut room.authorList,uIdx);
      author.banned = true //禁止
    }

    // 解封作者
    public entry fun unbanAuthor(_:&Write3AdminCap,room:&mut AuthorRoom,uIdx:u64) {
      let author = table::borrow_mut(&mut room.authorList,uIdx);
      author.banned = false //解封
    }

    // 更新作者信息
    public entry fun updateAuthor(_:&Write3AdminCap,room:&mut AuthorRoom, new_username: vector<u8>,uIdx:u64,  ctx: &mut TxContext) {
      let author = table::borrow_mut(&mut room.authorList,uIdx);
      author.username = new_username
    }

    // 创建作品
    public entry fun createWork(authorcap: &mut AuthorCap,uIdx:u64, title: vector<u8>, description: vector<u8>, ctx: &mut TxContext) {
        
        //是否有作者权限
        assert!(authorcap.book > 0,EAuthorBookNotEnough);
        let user = tx_context::sender(ctx);
        //证明我是我
        assert!(authorcap.useraddress == user ,EAuthorNotAuthor);

        authorcap.book = authorcap.book - 1;

        let id = object::new(ctx);
        let work = Work { 
          id, 
          author_id:uIdx, 
          title, 
          chapterList: table::new(ctx),
          count:0,
          description, 
          created_at: 0 };

        transfer::public_share_object(work);

        //event
    }

    //关联章节 1.章节对象 2.blobid 

    // 创建章节
    public entry fun createChapter(authorcap: &mut AuthorCap,work:&mut Work, title: vector<u8>, content: vector<u8>, blobid : vector<u8>,ctx: &mut TxContext){

        let user = tx_context::sender(ctx);
        assert!(authorcap.useraddress == user ,EAuthorNotAuthor);

        let id = object::new(ctx);
        let chapter = Chapter { 
          id, 
          title, 
          content, 
          blobid,
          created_at: 0 };

        table::add(&mut work.chapterList,work.count,chapter);
        work.count = work.count + 1;
        
    }

    //更新某章节内容
    public entry fun updateChapter(authorcap: &mut AuthorCap,work:&mut Work, title: vector<u8>, content: vector<u8>, blobid : vector<u8>,chapterIdx:u64,ctx: &mut TxContext){

        let user = tx_context::sender(ctx);
        assert!(authorcap.useraddress == user ,EAuthorNotAuthor);

        let chapter = table::borrow_mut(&mut work.chapterList,chapterIdx);
        
        chapter.blobid = blobid;
        chapter.title = title;
        chapter.content = content; 
        chapter.blobid = blobid;
        
    }

    // 删除章节
    public entry fun deleteChapter(authorcap: &mut AuthorCap,work:&mut Work,chapterIdx:u64, ctx: &mut TxContext) {
        let user = tx_context::sender(ctx);
        assert!(authorcap.useraddress == user ,EAuthorNotAuthor);
        let Chapter{id,title,content,blobid,created_at} = table::remove(&mut work.chapterList,chapterIdx);
        object::delete(id);

    }


    /*

    // 删除作品
    public entry fun deleteWork(id: UID, ctx: &mut TxContext) {
        let work = destroy<Work>(id);
    }

    */
}
