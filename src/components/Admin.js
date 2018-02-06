import React from 'react';
import AjouterRecettes from './AjouterRecettes';
import base from '../base';

class Admin extends React.Component {

  state = {
    uid: null,
    owner: null
  }

  componentDidMount() {
    base.onAuth(user => {
      if (user) {
        this.traitementConnexion(null, {user})
      }
    })
  }

  traiterChangement = (event, key) => {
    const recette = this.props.recette[key];
    const majRecettes = {
      ...recette,
      [event.target.name]: event.target.value
    };
    this.props.majRecettes(key, majRecettes);
  };

  
  connexion = (provider) => {
    base.authWithOAuthPopup(provider, this.traitementConnexion);
  };

  deconnexion = () => {
    base.unauth();
    this.setState({ uid: null });
  };

  traitementConnexion = (err, authData) => {
    if (err) {
      console.log(err);
      return;
    }

    // Recuperer le nom de la boite
    const boxRef = base.database().ref(this.props.pseudo)

    // Demander a firebase les donnees
    boxRef.once('value', snapshot => {
      const data = snapshot.val() || {};
      
      // Attribuer box si elle n'est a personne
      if (!data.owner) {
        boxRef.set({
          owner: authData.user.uid
        })
      }

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      })
    });
  };

  renderLogin = () => {
    return (
      <div className="login">
        <h2>Connecte toi pour créer tes recettes !</h2>
        <button className="facebook-button" onClick={() => this.connexion('facebook')}>Me connecter avec Facebook</button>
      </div>
    )
  };

  renderAdmin = (key) => {
    const recette = this.props.recette[key];
    return (
      <div className="card" key={key}>
        <form className="admin-form">
          <input type="text" name="nom" placeholder="Nom de la recette" onChange={e => this.traiterChangement(e, key) } value={recette.nom}/>

          <input type="text" name="image" placeholder="Adresse de l'image" onChange={e => this.traiterChangement(e, key) } value={recette.image} />

          <textarea name="ingredients" rows="3" placeholder="Liste des ingrédients séparés par une virgule" onChange={e => this.traiterChangement(e, key) } value={recette.ingredients}></textarea>

          <textarea name="instructions" rows="15" placeholder="Liste des instructions (une par ligne)" onChange={e => this.traiterChangement(e, key) } value={recette.instructions}></textarea>
        </form>
        <button onClick={() => this.props.supprimerRecettes(key)}>Supprimer</button>
      </div>
      )
    }

  render() {

    const deconnexion = <button onClick={this.deconnexion}>Déconnexion!</button>

    // Si il existe un propietaire
    if (!this.state.uid) {
      return <div>{this.renderLogin()}</div>
    }

    // Est-ce le proprietaire
    if (this.state.uid !== this.state.owner) {
      return (
        <div className="login">
          {this.renderLogin()}
          <p>Tu n'es pas le propiétaire de cette boîte à recettes.</p>
        </div>
      )
    }

    const adminCards = Object
      .keys(this.props.recette)
      .map(this.renderAdmin);

    return (
      <div className="cards">
        <AjouterRecettes ajouterRecettes={this.props.ajouterRecettes} />
        {adminCards}
        <footer>
          <button onClick={this.props.chargerRecettes}>Remplir</button>
          {deconnexion}
        </footer>
      </div>
    )
  }

  static propTypes = {
    recette: React.PropTypes.object.isRequired,
    chargerRecettes: React.PropTypes.func.isRequired,
    ajouterRecettes: React.PropTypes.func.isRequired,
    majRecettes: React.PropTypes.func.isRequired,
    supprimerRecettes: React.PropTypes.func.isRequired,
    pseudo: React.PropTypes.string.isRequired
  }
}

export default Admin;