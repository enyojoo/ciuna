"use strict";(()=>{var e={};e.id=189,e.ids=[189],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2615:e=>{e.exports=require("http")},5240:e=>{e.exports=require("https")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1568:e=>{e.exports=require("zlib")},9824:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>x,patchFetch:()=>h,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>g,staticGenerationAsyncStorage:()=>d});var s={};t.r(s),t.d(s,{GET:()=>p});var i=t(1686),o=t(4975),n=t(8640),a=t(8039),u=t(6974);async function p(e){try{let{data:{user:e},error:r}=await u.OQ.auth.getUser();if(r||!e)return a.NextResponse.json({error:"Unauthorized"},{status:401});let{data:t,error:s}=await u.OQ.from("listings").select(`
        id,
        title,
        price_rub,
        condition,
        status,
        city,
        district,
        photo_urls,
        created_at,
        view_count
      `).eq("seller_id",e.id).order("created_at",{ascending:!1});if(s)return console.error("Error fetching listings:",s),a.NextResponse.json({error:"Failed to fetch listings"},{status:500});return a.NextResponse.json(t||[])}catch(e){return console.error("Error in listings API:",e),a.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/user/listings/route",pathname:"/api/user/listings",filename:"route",bundlePath:"app/api/user/listings/route"},resolvedPagePath:"D:\\Users\\enyoc\\Documents\\Dev\\ciuna\\app\\api\\user\\listings\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:c,staticGenerationAsyncStorage:d,serverHooks:g}=l,x="/api/user/listings/route";function h(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:d})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[843,402,974],()=>t(9824));module.exports=s})();