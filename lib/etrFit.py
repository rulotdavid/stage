import sys
import json
import pickle
from sklearn.ensemble import ExtraTreesRegressor

X = json.loads(sys.argv[1])
Y = json.loads(sys.argv[2])

forest = ExtraTreesRegressor(n_estimators=800, min_samples_split=5, n_jobs=-1)
forest = forest.fit(X, Y)
scores = forest.score(X, Y)
print(scores)

with open("forest.obj", "wb") as filehandler:
    pickle.dump(forest, filehandler)

