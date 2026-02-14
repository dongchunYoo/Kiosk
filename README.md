# Android 개발자(예: App_React만):

git clone --filter=blob:none --no-checkout <REPO_URL> myrepo
cd myrepo
git sparse-checkout init --cone
git sparse-checkout set App_React
git checkout main


# 리얼 서버(예: Backend_Node와 Frontend_Node만):

git clone --filter=blob:none --no-checkout <REPO_URL> deploy-repo
cd deploy-repo
git sparse-checkout init --cone
git sparse-checkout set Backend_Node Frontend_Node
git checkout main


# 추가로 다른 폴더를 받고 싶을 때:

git sparse-checkout set App_React Backend_Node Frontend_Node


# Link
관리자 페이지 : http://localhost:5173/login
