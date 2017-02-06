echo "Starting in"
sleep 0.2
echo -ne "3"
sleep 1
echo -ne "2"
sleep 1
echo -ne "1"
sleep 1

git filter-branch --index-filter 'git rm --cached --ignore-unmatch *.mov' -- --all

clean()

sleep 0.2
rm -Rf .git/refs/original | echo "removing .git/refs/original"

sleep 0.2
rm -Rf .git/logs/ | echo "removing .git/logs"

sleep 0.2
git gc --aggressive --prune=now


echo "Bye $USER!"
