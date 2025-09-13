"use strict";(()=>{var e={};e.id=140,e.ids=[140],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2615:e=>{e.exports=require("http")},5240:e=>{e.exports=require("https")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1568:e=>{e.exports=require("zlib")},460:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>c,routeModule:()=>d,serverHooks:()=>l,staticGenerationAsyncStorage:()=>_});var s={};t.r(s),t.d(s,{GET:()=>p});var a=t(1686),n=t(4975),o=t(8640),i=t(8039),u=t(6974);async function p(e){try{let{data:{user:e},error:r}=await u.OQ.auth.getUser();if(r||!e)return i.NextResponse.json({error:"Unauthorized"},{status:401});let{data:t,error:s}=await u.OQ.from("conversations").select(`
        id,
        created_at,
        conversation_participants!inner (
          user_id,
          profiles!conversation_participants_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        ),
        messages (
          id,
          content,
          created_at,
          sender_id,
          read_at
        )
      `).eq("conversation_participants.user_id",e.id).order("created_at",{ascending:!1});if(s)return console.error("Error fetching conversations:",s),i.NextResponse.json({error:"Failed to fetch conversations"},{status:500});let a=t?.map(r=>{let t=r.conversation_participants?.find(r=>r.user_id!==e.id),s=t?.profiles,a=s?`${s.first_name||""} ${s.last_name||""}`.trim():"Unknown User",n=r.messages?.[0],o=r.messages?.filter(r=>r.sender_id!==e.id&&!r.read_at).length||0;return{id:r.id,conversation_id:r.id,other_user_name:a,other_user_avatar:s?.avatar_url,last_message:n?.content||"No messages yet",last_message_at:n?.created_at||r.created_at,unread_count:o}})||[];return i.NextResponse.json(a)}catch(e){return console.error("Error in messages API:",e),i.NextResponse.json({error:"Internal server error"},{status:500})}}let d=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/user/messages/route",pathname:"/api/user/messages",filename:"route",bundlePath:"app/api/user/messages/route"},resolvedPagePath:"D:\\Users\\enyoc\\Documents\\Dev\\ciuna\\app\\api\\user\\messages\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:c,staticGenerationAsyncStorage:_,serverHooks:l}=d,m="/api/user/messages/route";function g(){return(0,o.patchFetch)({serverHooks:l,staticGenerationAsyncStorage:_})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[843,402,974],()=>t(460));module.exports=s})();