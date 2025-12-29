#pour l'addition
def addition(x,y):
    return x + y

#pour la soustraction
def soustraction(x,y):
    return x - y

#pour la multiplication
def Multiplication(x,y):
    return x * y

#pour la division
def Division(x,y):
   if y == 0:
      print("Nombre 2 doit etre superieur a 0")
      return None
   return x / y

while True:
 print(""" Faites un choix de calcul :\n
    1. Addition\n
    2. Soustraction\n
    3. Multiplicatio\n
    4. Division\n""")

 choix = int(input("Quel est votre choix 1, 2, 3 ou 4 : "))

 if choix not in [1,2,3,4]:
    print("Votre choix est invalide. Veuillez entrer 1, 2, 3 ou 4: ")
    continue

 number1 = float(input("Entez le premier nombre : "))
 
#  if number1<0:
#      print("Choisissez un nombre positif ")
#      break

 number2 = float(input("Entez le deuxieme nombre : "))
 
#  if number2<0:
#     print("Choisissez un nombre positif ")
#     break


 if choix == 1:
    print(f"Le resultat de {number1} + {number2} = {addition(number1,number2)} ")
    
 elif choix == 2:
    print(f"Le resultat de {number1} - {number2} = {soustraction(number1,number2)} ")
    
 elif choix == 3:
    print(f"Le resultat de {number1} * {number2} = {Multiplication(number1,number2)} ")

 elif choix == 4:
    resultat=Division(number1,number2)
    if resultat is not None:
     print(f"Le resultat de {number1} / {number2} = {Division(number1,number2)} ")
    
 avis = str(input("Voulez-vous effectuer d'autres calculs ? (oui/non) "))

 if avis.lower() != "oui" :
    break

# table de multiplication
print("Maintenant nous allons effectuer une table de multiplication. \n Vous devez seulement entrer le nombre de votre table de multiplication")
n = int(input("Entrer un nombre : "))
for i in range(1, 11):
    print(f"{n} x {i} = {n*i}")
    
fruits=["orange","banane","pomme","melon","goyave","pasteque","kiwi"]
print( "le 3 ieme element de la liste est ",fruits[2])





